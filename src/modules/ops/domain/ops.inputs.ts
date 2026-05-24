import type {
  OpsEntityStatus,
  OpsPriority,
} from "./ops.states";

export type CreateOpsTaskInput = {
  title: string;
  description?: string | null;
  priority: OpsPriority;
  dueAt?: string | null;
};

export type UpdateOpsTaskStatusInput = {
  id: string;
  status: OpsEntityStatus;
};

export type CreateOpsAssetInput = {
  title: string;
  description?: string | null;
  assetType: "document" | "link" | "tool" | "template" | "other";
  url?: string | null;
};

export type CreateOpsClientInput = {
  title: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
};