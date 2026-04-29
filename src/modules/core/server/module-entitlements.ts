import { createClient } from "@/lib/supabase/server";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getEnabledModules } from "@/modules/registry/registry.queries";

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

export async function userHasModuleAccess(moduleKey: string): Promise<boolean> {
  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) {
    return false;
  }

  if (isOwnerRole(access.profile?.role)) {
    return true;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("module_entitlements")
    .select("id")
    .eq("user_id", access.user?.id)
    .eq("module_key", moduleKey)
    .eq("is_active", true)
    .maybeSingle();

  return Boolean(data);
}

export async function getMyActiveModuleKeys(): Promise<string[]> {
  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) {
    return [];
  }

  if (isOwnerRole(access.profile?.role)) {
    return getEnabledModules().map((module) => module.key);
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("module_entitlements")
    .select("module_key")
    .eq("user_id", access.user?.id)
    .eq("is_active", true);

  return data?.map((row) => row.module_key) ?? [];
}