import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";

type BillingProvider = "manual" | "whop";

type ProfileLookupRow = {
  id: string;
  email: string | null;
};

type EntitlementRow = {
  user_id: string;
  module_key: string;
  plan_code: BillingPlanCode;
  provider: BillingProvider;
  is_active: boolean;
  has_had_paid_access: boolean;
  provider_event_at: string | null;
  provider_event_id: string | null;
  provider_event_type: string | null;
};

export type WhopModuleEventResult =
  | "granted"
  | "revoked"
  | "manual-protected"
  | "stale-event";

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

  const exactMatches = ((profiles as ProfileLookupRow[] | null) ?? []).filter(
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

export async function getModuleEntitlement(params: {
  userId: string;
  moduleKey: string;
}): Promise<EntitlementRow | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("module_entitlements")
    .select(
      "user_id,module_key,plan_code,provider,is_active,has_had_paid_access,provider_event_at,provider_event_id,provider_event_type",
    )
    .eq("user_id", params.userId)
    .eq("module_key", params.moduleKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read module entitlement: ${error.message}`);
  }

  return (data as EntitlementRow | null) ?? null;
}

export async function grantModuleAccess(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  provider?: BillingProvider;
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

/**
 * Applica un evento Whop all'entitlement attraverso una funzione SQL atomica.
 *
 * La RPC protegge:
 * - entitlement manuali attivi;
 * - webhook Whop fuori ordine;
 * - stato paid storico;
 * - concorrenza sullo stesso entitlement.
 */
export async function applyWhopModuleEvent(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  action: "grant" | "revoke";
  eventId: string;
  eventType: string;
  eventAt: string;
}): Promise<WhopModuleEventResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("apply_whop_module_event", {
    p_user_id: params.userId,
    p_module_key: params.moduleKey,
    p_plan_code: params.planCode,
    p_event_action: params.action,
    p_event_id: params.eventId,
    p_event_type: params.eventType,
    p_event_at: params.eventAt,
  });

  if (error) {
    throw new Error(`Failed to apply Whop module event: ${error.message}`);
  }

  const result = String(data ?? "").trim() as WhopModuleEventResult;

  const allowedResults: WhopModuleEventResult[] = [
    "granted",
    "revoked",
    "manual-protected",
    "stale-event",
  ];

  if (!allowedResults.includes(result)) {
    throw new Error(`Unexpected Whop module event result: ${String(data)}`);
  }

  return result;
}

/**
 * Legacy helper.
 * Manteniamo questa funzione per eventuali riferimenti interni non ancora
 * migrati, ma i webhook devono usare applyWhopModuleEvent().
 */
export async function grantWhopModuleAccess(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
}): Promise<"granted" | "manual-protected"> {
  const existing = await getModuleEntitlement({
    userId: params.userId,
    moduleKey: params.moduleKey,
  });

  if (existing?.provider === "manual" && existing.is_active) {
    return "manual-protected";
  }

  await grantModuleAccess({
    userId: params.userId,
    moduleKey: params.moduleKey,
    planCode: params.planCode,
    provider: "whop",
  });

  return "granted";
}

/**
 * Legacy helper.
 * I webhook devono usare applyWhopModuleEvent().
 */
export async function revokeWhopModuleAccess(params: {
  userId: string;
  moduleKey: string;
}): Promise<"revoked" | "manual-protected" | "not-whop"> {
  const existing = await getModuleEntitlement({
    userId: params.userId,
    moduleKey: params.moduleKey,
  });

  if (!existing) {
    return "not-whop";
  }

  if (existing.provider === "manual") {
    return "manual-protected";
  }

  if (existing.provider !== "whop") {
    return "not-whop";
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("module_entitlements")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", params.userId)
    .eq("module_key", params.moduleKey)
    .eq("provider", "whop");

  if (error) {
    throw new Error(`Failed to revoke Whop module access: ${error.message}`);
  }

  return "revoked";
}

export async function grantModuleAccessByEmail(params: {
  email: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  provider?: BillingProvider;
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
