import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";

type ProfileLookupRow = {
  id: string;
  email: string | null;
};

async function findProfileIdByEmail(email: string): Promise<string> {
  const supabase = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,email")
    .ilike("email", normalizedEmail);

  if (error) {
    throw new Error(`Failed to find profile: ${error.message}`);
  }

  const exactMatches = (profiles as ProfileLookupRow[] | null ?? []).filter(
    (profile) => profile.email?.trim().toLowerCase() === normalizedEmail,
  );

  if (exactMatches.length === 0) {
    throw new Error(`No profile found for email: ${normalizedEmail}`);
  }

  if (exactMatches.length > 1) {
    throw new Error(`Multiple profiles found for email: ${normalizedEmail}`);
  }

  return exactMatches[0].id;
}

export async function grantModuleAccess(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  provider?: "manual" | "whop";
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("module_entitlements").upsert(
    {
      user_id: params.userId,
      module_key: params.moduleKey,
      plan_code: params.planCode,
      provider: params.provider ?? "manual",
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,module_key",
    },
  );

  if (error) {
    throw new Error(`Failed to grant module access: ${error.message}`);
  }
}

export async function revokeModuleAccess(params: {
  userId: string;
  moduleKey: string;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("module_entitlements")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", params.userId)
    .eq("module_key", params.moduleKey);

  if (error) {
    throw new Error(`Failed to revoke module access: ${error.message}`);
  }
}

export async function grantModuleAccessByEmail(params: {
  email: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  provider?: "manual" | "whop";
}) {
  const userId = await findProfileIdByEmail(params.email);

  await grantModuleAccess({
    userId,
    moduleKey: params.moduleKey,
    planCode: params.planCode,
    provider: params.provider ?? "whop",
  });
}

export async function revokeModuleAccessByEmail(params: {
  email: string;
  moduleKey: string;
}) {
  const userId = await findProfileIdByEmail(params.email);

  await revokeModuleAccess({
    userId,
    moduleKey: params.moduleKey,
  });
}