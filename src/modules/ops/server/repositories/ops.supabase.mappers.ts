import type {
  OpsAsset,
  OpsClient,
  OpsSale,
  OpsTask,
  OpsWorkflow,
} from "@/modules/ops/domain/ops.entities";

export type OpsSupabaseItemRow = {
  id: string;
  user_id: string;
  workspace_id: string | null;

  type: "task" | "asset" | "client" | "sale" | "workflow";

  title: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";

  priority: "low" | "medium" | "high" | "urgent" | null;
  due_at: string | null;

  asset_type: "document" | "link" | "tool" | "template" | "other" | null;
  url: string | null;

  email: string | null;
  phone: string | null;

  amount_cents: number | null;
  currency: string | null;

  trigger_type: "manual" | "scheduled" | "event" | null;

  metadata: Record<string, unknown>;

  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export function mapOpsTaskRow(row: OpsSupabaseItemRow): OpsTask {
  return {
    id: row.id,
    type: "task",
    workspaceId: row.workspace_id ?? "user-owned",
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority ?? "medium",
    dueAt: row.due_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOpsAssetRow(row: OpsSupabaseItemRow): OpsAsset {
  return {
    id: row.id,
    type: "asset",
    workspaceId: row.workspace_id ?? "user-owned",
    title: row.title,
    description: row.description,
    status: row.status,
    assetType: row.asset_type ?? "other",
    url: row.url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOpsClientRow(row: OpsSupabaseItemRow): OpsClient {
  return {
    id: row.id,
    type: "client",
    workspaceId: row.workspace_id ?? "user-owned",
    title: row.title,
    description: row.description,
    status: row.status,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOpsSaleRow(row: OpsSupabaseItemRow): OpsSale {
  return {
    id: row.id,
    type: "sale",
    workspaceId: row.workspace_id ?? "user-owned",
    title: row.title,
    description: row.description,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOpsWorkflowRow(row: OpsSupabaseItemRow): OpsWorkflow {
  return {
    id: row.id,
    type: "workflow",
    workspaceId: row.workspace_id ?? "user-owned",
    title: row.title,
    description: row.description,
    status: row.status,
    triggerType: row.trigger_type ?? "manual",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

import type {
  OpsActivityEvent,
  OpsActivityEventType,
} from "@/modules/ops/domain/ops.events";
import type { OpsEntityStatus } from "@/modules/ops/domain/ops.states";

export type OpsSupabaseActivityEventRow = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  item_id: string;
  item_type: string;
  event_type: OpsActivityEventType;
  title: string;
  description: string | null;
  from_status: OpsEntityStatus | null;
  to_status: OpsEntityStatus | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function mapOpsActivityEventRow(
  row: OpsSupabaseActivityEventRow,
): OpsActivityEvent {
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    itemId: row.item_id,
    itemType: row.item_type,
    eventType: row.event_type,
    title: row.title,
    description: row.description,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}
