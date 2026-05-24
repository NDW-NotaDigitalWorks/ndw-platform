import type {
  CreateOpsTaskInput,
  UpdateOpsTaskStatusInput,
} from "@/modules/ops/domain/ops.inputs";

import type { OpsActivityEvent } from "@/modules/ops/domain/ops.events";

import type {
  OpsAsset,
  OpsClient,
  OpsSale,
  OpsTask,
  OpsWorkflow,
} from "@/modules/ops/domain/ops.entities";

export type OpsRepository = {
  getTasks(): Promise<OpsTask[]>;

  getTaskById(id: string): Promise<OpsTask | null>;

  getAssets(): Promise<OpsAsset[]>;

  getClients(): Promise<OpsClient[]>;

  getSales(): Promise<OpsSale[]>;

  getWorkflows(): Promise<OpsWorkflow[]>;

  createTask(input: CreateOpsTaskInput): Promise<string>;

  updateTaskStatus(input: UpdateOpsTaskStatusInput): Promise<void>;

  createActivityEvent(
  event: Omit<OpsActivityEvent, "id" | "userId" | "createdAt">,
): Promise<void>;

getRecentActivityEvents(): Promise<OpsActivityEvent[]>;
getActivityEventsByItemId(itemId: string): Promise<OpsActivityEvent[]>;
};