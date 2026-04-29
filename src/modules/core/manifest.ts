import type { ModuleDefinition } from "@/modules/registry/types";

export const coreModule: ModuleDefinition = {
  key: "core",
  name: "Core",
  navLabel: "Core",
  description: "NDW Core Workspace",
  category: "core",
  status: "active",
  requiredPlan: "free",
  isEnabled: true,
  href: "/app/core",

  loadPage: async () => {
    const module = await import("./ui/CoreModulePage");
    return module.default;
  },
};