import { createClient } from "@/lib/supabase/server";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getEnabledModules } from "@/modules/registry/registry.queries";

const ROUTEPRO_MODULE_KEY = "routepro";

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

  /*
   * RoutePro GO LIVE
   *
   * RoutePro supporta un trial proprietario NDW.
   *
   * - nessuna storia paid -> può entrare nella home RoutePro;
   * - entitlement manual attivo -> accesso;
   * - entitlement Whop attivo -> accesso;
   * - ex cliente paid con entitlement inattivo -> niente fallback al trial.
   *
   * Il trial NON viene creato qui: continua a partire soltanto
   * quando l'utente usa realmente il flusso AI.
   */
  if (moduleKey === ROUTEPRO_MODULE_KEY) {
    const { data: entitlement, error } = await supabase
      .from("module_entitlements")
      .select("provider,is_active,has_had_paid_access")
      .eq("user_id", access.user?.id)
      .eq("module_key", ROUTEPRO_MODULE_KEY)
      .maybeSingle();

    if (error) {
      throw new Error(
        `RoutePro entitlement lookup failed: ${error.message}`,
      );
    }

    if (entitlement?.is_active === true) {
      return true;
    }

    if (entitlement?.has_had_paid_access === true) {
      return false;
    }

    return true;
  }

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

  const activeKeys = data?.map((row) => row.module_key) ?? [];

  /*
   * RoutePro rimane visibile nel workspace anche prima
   * dell'attivazione del trial.
   *
   * Per un ex cliente cancellato il link resta visibile:
   * cliccandolo, userHasModuleAccess() lo invierà alla pagina
   * di upgrade/riattivazione.
   */
  if (!activeKeys.includes(ROUTEPRO_MODULE_KEY)) {
    activeKeys.push(ROUTEPRO_MODULE_KEY);
  }

  return activeKeys;
}
