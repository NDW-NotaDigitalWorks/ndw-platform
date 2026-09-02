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
    .select("user_id,module_key,plan_code,provider,is_active")
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

export async function grantWhopModuleAccess(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
}): Promise<"granted" | "manual-protected"> {
  const existing = await getModuleEntitlement({
    userId: params.userId,
    moduleKey: params.moduleKey,
  });

  /*
   * Un accesso manuale ATTIVO è un override amministrativo.
   * Whop non deve trasformarlo in un entitlement Whop.
   */
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