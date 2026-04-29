import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { getEnabledModules } from "@/modules/registry/registry.queries";

export type CoreWorkspaceData = {
  title: string;
  subtitle: string;
  userEmail: string | null;
  role: string | null;
  modules: {
    key: string;
    name: string;
    navLabel: string;
    description: string;
    href: string;
    status: string;
    category: string;
    requiredPlan: string;
    hasAccess: boolean;
  }[];
};

export async function getCoreWorkspaceData(): Promise<CoreWorkspaceData> {
  const access = await getMyCoreAccessState();

  const enabledModules = getEnabledModules();
  const activeModuleKeys = await getMyActiveModuleKeys();
  const activeModuleKeySet = new Set(activeModuleKeys);

  return {
    title: "NDW Core Workspace",
    subtitle: "Area privata centrale della piattaforma NDW.",
    userEmail: access.user?.email ?? null,
    role: access.profile?.role ?? null,
    modules: enabledModules.map((module) => ({
      key: module.key,
      name: module.name,
      navLabel: module.navLabel,
      description: module.description,
      href: module.href,
      status: module.status,
      category: module.category,
      requiredPlan: module.requiredPlan,
      hasAccess: activeModuleKeySet.has(module.key),
    })),
  };
}