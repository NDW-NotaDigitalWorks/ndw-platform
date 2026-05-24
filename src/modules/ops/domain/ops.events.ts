import type { OpsEntityStatus } from "./ops.states";

export type OpsActivityEventType =
  | "item_created"
  | "item_status_changed"
  | "item_paused"
  | "item_completed"
  | "item_archived";

export type OpsActivityEvent = {
  id: string;

  userId: string;

  workspaceId?: string | null;

  itemId: string;

  itemType: string;

  eventType: OpsActivityEventType;

  title: string;

  description?: string | null;

  fromStatus?: OpsEntityStatus | null;

  toStatus?: OpsEntityStatus | null;

  metadata?: Record<string, unknown>;

  createdAt: string;
};