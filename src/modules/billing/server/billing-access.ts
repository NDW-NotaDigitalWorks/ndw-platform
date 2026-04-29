import { createClient } from "@/lib/supabase/server";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";

export async function grantModuleAccess(params: {
  userId: string;
  moduleKey: string;
  planCode: BillingPlanCode;
  provider?: "manual" | "whop";
}) {
  const supabase = await createClient();

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
    }
  );

  if (error) {
    throw new Error(`Failed to grant module access: ${error.message}`);
  }
}

export async function revokeModuleAccess(params: {
  userId: string;
  moduleKey: string;
}) {
  const supabase = await createClient();

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