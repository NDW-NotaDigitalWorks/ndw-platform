import type { ModuleDefinition } from "@/modules/registry/types";

export const agendaModule: ModuleDefinition = {
  key: "agenda",
  name: "Agenda",
  navLabel: "Agenda",
  description: "Gestione agenda e appuntamenti.",
  category: "productivity",
  status: "beta",
  requiredPlan: "base",
  isEnabled: true,
  href: "/app/agenda",

  loadPage: async () => {
    const module = await import("./ui/AgendaModulePage");
    return module.default;
  },
};