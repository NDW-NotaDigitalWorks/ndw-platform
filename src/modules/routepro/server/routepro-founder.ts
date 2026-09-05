import { createAdminClient } from "@/lib/supabase/admin";

export const ROUTEPRO_FOUNDER_LIMIT = 100;

export type RouteProFounderAssignment = {
  founderNumber: number | null;
};

type RouteProEnvironment = "sandbox" | "production";

function getRouteProEnvironment(): RouteProEnvironment {
  return process.env.WHOP_ENVIRONMENT === "sandbox"
    ? "sandbox"
    : "production";
}

export async function getRouteProFounderCount(): Promise<number> {
  const supabase = createAdminClient();
  const environment = getRouteProEnvironment();

  const { data, error } = await supabase.rpc(
    "get_routepro_founder_count",
    {
      p_environment: environment,
    },
  );

  if (error) {
    throw new Error(
      `Failed to read RoutePro founder count (${environment}): ${error.message}`,
    );
  }

  const count = Number(data ?? 0);

  if (!Number.isFinite(count) || count < 0) {
    throw new Error(
      `Invalid RoutePro founder count (${environment}): ${String(data)}`,
    );
  }

  return count;
}

export async function hasRouteProFounderAvailability(): Promise<boolean> {
  const count = await getRouteProFounderCount();

  return count < ROUTEPRO_FOUNDER_LIMIT;
}

export async function assignRouteProFounder(params: {
  userId: string;
  whopPlanId: string;
  whopEventId: string;
}): Promise<RouteProFounderAssignment> {
  const supabase = createAdminClient();
  const environment = getRouteProEnvironment();

  const { data, error } = await supabase.rpc(
    "assign_routepro_founder",
    {
      p_environment: environment,
      p_user_id: params.userId,
      p_whop_plan_id: params.whopPlanId,
      p_whop_event_id: params.whopEventId,
    },
  );

  if (error) {
    throw new Error(
      `Failed to assign RoutePro founder (${environment}): ${error.message}`,
    );
  }

  if (data === null || data === undefined) {
    return {
      founderNumber: null,
    };
  }

  const founderNumber = Number(data);

  if (
    !Number.isInteger(founderNumber) ||
    founderNumber < 1 ||
    founderNumber > ROUTEPRO_FOUNDER_LIMIT
  ) {
    throw new Error(
      `Invalid RoutePro founder number (${environment}): ${String(data)}`,
    );
  }

  return {
    founderNumber,
  };
}