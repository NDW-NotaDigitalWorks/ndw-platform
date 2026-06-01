import type { ModuleDefinition } from "@/modules/registry/types";

export const routeProModule: ModuleDefinition = {
  key: "routepro",
  name: "RoutePro",
  navLabel: "RoutePro",
  description:
  "Delivery Workflow System per driver multi-stop e corrieri.",
  category: "logistics",
  status: "beta",
  requiredPlan: "base",
  isEnabled: true,
  href: "/app/routepro",

  loadPage: async () => {
  const loadedModule = await import("./ui/RouteProModulePage");
  return loadedModule.default;
},
};