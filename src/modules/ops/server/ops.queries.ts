import { buildOpsWorkspaceDashboardViewModel } from "@/modules/ops/domain/ops.dashboard";
import { mapOpsActivityEventToFeedItemViewModel } from "@/modules/ops/domain/ops.mappers";
import { mapOpsEntitiesToSectionViewModel } from "@/modules/ops/domain/ops.mappers";
import { getOpsAreas } from "@/modules/ops/registry/ops.registry";
import { mapOpsTaskToDetailViewModel } from "@/modules/ops/domain/ops.mappers";

import {
  buildOpsAttentionItems,
  buildOpsAttentionSummary,
  getPrimaryAttentionItems,
  getSecondaryAttentionItems,
} from "./ops.attention";
import { getOpsRepository } from "./repositories/ops.repository";

export async function getOpsDashboardViewModel() {
  const repository = await getOpsRepository();

  const dashboard = buildOpsWorkspaceDashboardViewModel(getOpsAreas());

  const [tasks, activityEvents] = await Promise.all([
    repository.getTasks(),
    repository.getRecentActivityEvents(),
  ]);

  const attentionItems = buildOpsAttentionItems({
    tasks,
    events: activityEvents,
  });

  return {
    ...dashboard,
    activityFeed: activityEvents.map(mapOpsActivityEventToFeedItemViewModel),
    attentionItems,
    attentionSummary: buildOpsAttentionSummary(attentionItems),
    primaryAttentionItems: getPrimaryAttentionItems(attentionItems),
    secondaryAttentionItems: getSecondaryAttentionItems(attentionItems),
  };
}

export async function getOpsTasksSectionViewModel() {
  const repository = await getOpsRepository();

  const tasks = await repository.getTasks();

  return mapOpsEntitiesToSectionViewModel({
    title: "Tasks",
    subtitle: "Attività operative, priorità e lavoro quotidiano.",
    emptyTitle: "Nessun task operativo",
    emptyDescription:
      "Quando creerai task e attività operative, compariranno qui.",
    entities: tasks,
  });
}

export async function getOpsAssetsSectionViewModel() {
  const repository = await getOpsRepository();

  const assets = await repository.getAssets();

  return mapOpsEntitiesToSectionViewModel({
    title: "Assets",
    subtitle:
      "Risorse, template, link e strumenti utili al lavoro operativo.",
    emptyTitle: "Nessun asset salvato",
    emptyDescription:
      "Template, link e documenti operativi compariranno qui.",
    entities: assets,
  });
}

export async function getOpsClientsSectionViewModel() {
  const repository = await getOpsRepository();

  const clients = await repository.getClients();

  return mapOpsEntitiesToSectionViewModel({
    title: "Clients",
    subtitle: "Clienti, contatti e relazioni operative.",
    emptyTitle: "Nessun cliente",
    emptyDescription:
      "I clienti e i contatti operativi compariranno qui.",
    entities: clients,
  });
}

export async function getOpsSalesSectionViewModel() {
  const repository = await getOpsRepository();

  const sales = await repository.getSales();

  return mapOpsEntitiesToSectionViewModel({
    title: "Sales",
    subtitle: "Vendite, offerte e opportunità commerciali.",
    emptyTitle: "Nessuna vendita tracciata",
    emptyDescription:
      "Le opportunità e vendite operative compariranno qui.",
    entities: sales,
  });
}

export async function getOpsWorkflowsSectionViewModel() {
  const repository = await getOpsRepository();

  const workflows = await repository.getWorkflows();

  return mapOpsEntitiesToSectionViewModel({
    title: "Workflows",
    subtitle: "Processi, sequenze operative e flussi di lavoro.",
    emptyTitle: "Nessun workflow",
    emptyDescription:
      "I workflow operativi compariranno qui.",
    entities: workflows,
  });
}

export async function getOpsTaskDetailViewModel(itemId: string) {
  const repository = await getOpsRepository();

  const [task, timelineEvents] = await Promise.all([
    repository.getTaskById(itemId),
    repository.getActivityEventsByItemId(itemId),
  ]);

  if (!task) {
    return null;
  }

  return mapOpsTaskToDetailViewModel({
    task,
    timelineEvents,
  });
}