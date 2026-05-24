import { agendaModule } from "@/modules/agenda/manifest";
import { coreModule } from "@/modules/core/manifest";
import { opsModule } from "@/modules/ops/manifest";
import { routeProModule } from "@/modules/routepro/manifest";
import type { ModuleDefinition } from "./types";

export const MODULES: ModuleDefinition[] = [
  coreModule,
  agendaModule,
  opsModule,
  routeProModule,
];