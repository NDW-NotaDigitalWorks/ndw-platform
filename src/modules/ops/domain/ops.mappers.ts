import type { OpsAreaDefinition } from "./ops.types";
import type { OpsEntity } from "./ops.entities";
import type {
  OpsAreaViewModel,
  OpsDashboardViewModel,
  OpsEntityCardViewModel,
} from "./ops.view-models";

function getOpsAreaBadgeLabel(status: OpsAreaDefinition["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "planned":
      return "Planned";
    case "locked":
      return "Locked";
  }
}

function getOpsEntityStatusLabel(status: OpsEntity["status"]): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
  }
}

export function mapOpsAreaToViewModel(
  area: OpsAreaDefinition,
): OpsAreaViewModel {
  return {
    key: area.key,
    title: area.title,
    description: area.description,
    href: area.href,
    status: area.status,
    badgeLabel: getOpsAreaBadgeLabel(area.status),
  };
}

export function mapOpsAreasToDashboardViewModel(
  areas: OpsAreaDefinition[],
): OpsDashboardViewModel {
  return {
    title: "NDW Ops Workspace",
    subtitle:
      "Sistema operativo modulare per workflow, organizzazione e micro-business.",
    areas: areas.map(mapOpsAreaToViewModel),
  };
}

export function mapOpsEntityToCardViewModel(
  entity: OpsEntity,
): OpsEntityCardViewModel {
  return {
  id: entity.id,
  entityType: entity.type,
  status: entity.status,
  priority: "priority" in entity ? entity.priority : null,
  title: entity.title,
  subtitle: entity.description ?? null,
  statusLabel: getOpsEntityStatusLabel(entity.status),
  href: `/app/ops/${entity.type}s/${entity.id}`,
};
}

import type { OpsSectionViewModel } from "./ops.view-models";

export function mapOpsEntitiesToSectionViewModel(params: {
  title: string;
  subtitle: string;

  emptyTitle: string;
  emptyDescription: string;

  entities: OpsEntity[];
}): OpsSectionViewModel {
  const mappedEntities = params.entities.map(
    mapOpsEntityToCardViewModel,
  );

  return {
    title: params.title,
    subtitle: params.subtitle,

    metrics: [
      {
        label: "Totale",
        value: mappedEntities.length,
      },
      {
        label: "Attivi",
        value: params.entities.filter(
          (entity) => entity.status === "active",
        ).length,
      },
    ],

    entities: mappedEntities,

    emptyState: {
      title: params.emptyTitle,
      description: params.emptyDescription,
    },
  };
}

import type { OpsActivityEvent } from "./ops.events";
import type { OpsActivityFeedItemViewModel } from "./ops.view-models";

export function mapOpsActivityEventToFeedItemViewModel(
  event: OpsActivityEvent,
): OpsActivityFeedItemViewModel {
  return {
    id: event.id,
    title: event.title,
    description:
      event.description ??
      `${event.eventType} su ${event.itemType}`,
    timestampLabel: new Date(event.createdAt).toLocaleString("it-IT"),
  };
}

import type { OpsTask } from "./ops.entities";
import type {
  OpsEntityDetailViewModel,
  OpsTimelineItemViewModel,
} from "./ops.view-models";

export function mapOpsActivityEventToTimelineItemViewModel(
  event: OpsActivityEvent,
): OpsTimelineItemViewModel {
  return {
    id: event.id,
    title: event.title,
    description:
      event.description ??
      `${event.eventType} su ${event.itemType}`,
    timestampLabel: new Date(event.createdAt).toLocaleString("it-IT"),
    eventType: event.eventType,
  };
}

export function mapOpsTaskToDetailViewModel(params: {
  task: OpsTask;
  timelineEvents: OpsActivityEvent[];
}): OpsEntityDetailViewModel {
  return {
    id: params.task.id,
    entityType: params.task.type,
    title: params.task.title,
    description: params.task.description ?? null,
    status: params.task.status,
    statusLabel: getOpsEntityStatusLabel(params.task.status),

    primaryMeta: [
      {
        label: "Priorità",
        value: params.task.priority,
      },
      {
        label: "Status",
        value: getOpsEntityStatusLabel(params.task.status),
      },
    ],

    secondaryMeta: [
      {
        label: "Creato",
        value: new Date(params.task.createdAt).toLocaleString("it-IT"),
      },
      {
        label: "Aggiornato",
        value: new Date(params.task.updatedAt).toLocaleString("it-IT"),
      },
    ],

    timeline: params.timelineEvents.map(
      mapOpsActivityEventToTimelineItemViewModel,
    ),
  };
}