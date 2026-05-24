import type { OpsAreaDefinition } from "@/modules/ops/domain/ops.types";

export const OPS_AREAS: OpsAreaDefinition[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Vista centrale del modulo NDW Ops.",
    status: "active",
    href: "/app/ops",
  },
  {
    key: "assets",
    title: "Assets",
    description: "Gestione futura di asset, risorse e strumenti operativi.",
    status: "planned",
    href: "/app/ops/assets",
  },
  {
    key: "tasks",
    title: "Tasks",
    description: "Gestione futura di attività, priorità e lavoro quotidiano.",
    status: "planned",
    href: "/app/ops/tasks",
  },
  {
    key: "clients",
    title: "Clients",
    description: "Gestione futura di clienti, contatti e relazioni operative.",
    status: "planned",
    href: "/app/ops/clients",
  },
  {
    key: "sales",
    title: "Sales",
    description: "Gestione futura di vendite, offerte e pipeline.",
    status: "planned",
    href: "/app/ops/sales",
  },
  {
    key: "workflows",
    title: "Workflows",
    description: "Gestione futura di processi, automazioni e flussi operativi.",
    status: "planned",
    href: "/app/ops/workflows",
  },
];

export function getOpsAreas(): OpsAreaDefinition[] {
  return OPS_AREAS;
}