import type {
  OpsEntityStatus,
  OpsPriority,
} from "./ops.states";

export type OpsEntityId = string;

export type OpsBaseEntity = {
  id: OpsEntityId;
  workspaceId: string;

  title: string;
  description?: string | null;

  status: OpsEntityStatus;

  createdAt: string;
  updatedAt: string;
};

export type OpsTask = OpsBaseEntity & {
  type: "task";

  priority: OpsPriority;

  dueAt?: string | null;
};

export type OpsAsset = OpsBaseEntity & {
  type: "asset";

  assetType:
    | "document"
    | "link"
    | "tool"
    | "template"
    | "other";

  url?: string | null;
};

export type OpsClient = OpsBaseEntity & {
  type: "client";

  email?: string | null;
  phone?: string | null;
};

export type OpsSale = OpsBaseEntity & {
  type: "sale";

  amountCents?: number | null;
  currency?: string | null;
};

export type OpsWorkflow = OpsBaseEntity & {
  type: "workflow";

  triggerType?: "manual" | "scheduled" | "event";
};

export type OpsEntity =
  | OpsTask
  | OpsAsset
  | OpsClient
  | OpsSale
  | OpsWorkflow;