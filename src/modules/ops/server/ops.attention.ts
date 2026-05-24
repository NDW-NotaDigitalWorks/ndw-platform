import type {
  OpsAttentionItem,
  OpsAttentionSummary,
} from "@/modules/ops/domain/ops.attention";

import type { OpsActivityEvent } from "@/modules/ops/domain/ops.events";
import type { OpsTask } from "@/modules/ops/domain/ops.entities";


function createAttentionId(prefix: string, id: string) {
  return `${prefix}_${id}`;
}

export function buildTaskAttentionItems(
  tasks: OpsTask[],
): OpsAttentionItem[] {
  const now = new Date().toISOString();

  return tasks.flatMap((task) => {
    const items: OpsAttentionItem[] = [];

    if (task.status === "paused") {
      items.push({
        id: createAttentionId("paused_task", task.id),
        title: "Task in pausa",
        description: task.title,
        severity: "warning",
        priority: 60,
        sourceType: "item",
        sourceId: task.id,
        createdAt: now,
      });
    }

    if (task.status === "completed") {
      items.push({
        id: createAttentionId("completed_task", task.id),
        title: "Task completato da archiviare",
        description: task.title,
        severity: "info",
        priority: 20,
        sourceType: "item",
        sourceId: task.id,
        createdAt: now,
      });
    }

    if (task.status === "active" && task.priority === "urgent") {
      items.push({
        id: createAttentionId("urgent_task", task.id),
        title: "Task urgente attivo",
        description: task.title,
        severity: "warning",
        priority: 80,
        sourceType: "item",
        sourceId: task.id,
        createdAt: now,
      });
    }

    return items;
  });
}

export function buildActivityAttentionItems(
  events: OpsActivityEvent[],
): OpsAttentionItem[] {
  return events
    .filter((event) =>
      ["item_completed", "item_archived"].includes(event.eventType),
    )
    .slice(0, 3)
    .map((event) => ({
      id: createAttentionId("activity", event.id),
      title:
        event.eventType === "item_archived"
          ? "Item archiviato di recente"
          : "Item completato di recente",
      description: event.description ?? event.title,
      severity: "info",
      priority: 20,
      sourceType: "activity",
      sourceId: event.id,
      createdAt: event.createdAt,
    }));
}

export function buildOpsAttentionItems(params: {
  tasks: OpsTask[];
  events: OpsActivityEvent[];
}): OpsAttentionItem[] {
  return sortOpsAttentionItems([
  ...buildTaskAttentionItems(params.tasks),
  ...buildActivityAttentionItems(params.events),
]);
}

export function sortOpsAttentionItems(
  items: OpsAttentionItem[],
): OpsAttentionItem[] {
  return [...items].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
}

export function getPrimaryAttentionItems(
  items: OpsAttentionItem[],
): OpsAttentionItem[] {
  return sortOpsAttentionItems(items).filter(
    (item) =>
      item.severity === "critical" ||
      item.severity === "warning",
  );
}

export function getSecondaryAttentionItems(
  items: OpsAttentionItem[],
): OpsAttentionItem[] {
  return sortOpsAttentionItems(items).filter(
    (item) => item.severity === "info",
  );
}

export function buildOpsAttentionSummary(
  items: OpsAttentionItem[],
): OpsAttentionSummary {
  const critical = items.filter(
    (item) => item.severity === "critical",
  ).length;

  const warning = items.filter(
    (item) => item.severity === "warning",
  ).length;

  const info = items.filter(
    (item) => item.severity === "info",
  ).length;

  return {
    total: items.length,
    critical,
    warning,
    info,
    healthy: items.length === 0,
  };
}