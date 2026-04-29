import type { ModuleDefinition } from "@/modules/registry/types";

export const routeProModule: ModuleDefinition = {
  key: "routepro",
  name: "RoutePro",
  navLabel: "RoutePro",
  description: "Ottimizzazione percorsi per driver e corrieri.",
  category: "logistics",
  status: "beta",
  requiredPlan: "base",
  isEnabled: true,
  href: "/app/routepro",

  loadPage: async () => {
    const module = await import("./ui/RouteProModulePage");
    return module.default;
  },
};