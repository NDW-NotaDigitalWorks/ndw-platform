import type { ModuleDefinition } from "@/modules/registry/types";

export const opsModule: ModuleDefinition = {
  key: "ops",
  name: "NDW Ops",
  navLabel: "Ops",
  description: "Sistema operativo modulare per micro-business e workflow operativi.",
  category: "productivity",
  status: "beta",
  requiredPlan: "base",
  isEnabled: true,
  href: "/app/ops",

  loadPage: async () => {
  const loadedModule = await import("./ui/OpsModulePage");
  return loadedModule.default;
},
};