"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canTransitionOpsStatus } from "@/modules/ops/domain/ops.lifecycle";

import { getOpsWriteRepository } from "./repositories/ops.repository";
import {
  validateCreateOpsTaskFormData,
  validateUpdateOpsTaskStatusFormData,
} from "./ops.validation";

export async function createOpsTaskAction(formData: FormData) {
  const validation = validateCreateOpsTaskFormData(formData);

  if (!validation.ok) {
    redirect(
      `/app/ops/tasks?error=${encodeURIComponent(validation.error)}`,
    );
  }

  const repository = await getOpsWriteRepository();

  const taskId = await repository.createTask(validation.data);

await repository.createActivityEvent({
  itemId: taskId,
  itemType: "task",
  eventType: "item_created",
  title: "Task creato",
  description: validation.data.title,
  toStatus: "active",
});

  revalidatePath("/app/ops");
  revalidatePath("/app/ops/tasks");

  redirect("/app/ops/tasks?created=1");
}

export async function updateOpsTaskStatusAction(formData: FormData) {
  const validation = validateUpdateOpsTaskStatusFormData(formData);

  if (!validation.ok) {
    redirect(
      `/app/ops/tasks?error=${encodeURIComponent(validation.error)}`,
    );
  }

  const repository = await getOpsWriteRepository();

  const currentTask = await repository.getTaskById(validation.data.id);

  if (!currentTask) {
    redirect("/app/ops/tasks?error=Task%20non%20trovato");
  }

  const canTransition = canTransitionOpsStatus(
    currentTask.status,
    validation.data.status,
  );

  if (!canTransition) {
    redirect(
      "/app/ops/tasks?error=Transizione%20status%20non%20consentita",
    );
  }

  await repository.updateTaskStatus(validation.data);

const eventType =
  validation.data.status === "paused"
    ? "item_paused"
    : validation.data.status === "completed"
      ? "item_completed"
      : validation.data.status === "archived"
        ? "item_archived"
        : "item_status_changed";

await repository.createActivityEvent({
  itemId: validation.data.id,
  itemType: "task",
  eventType,
  title: "Status task aggiornato",
  description: currentTask.title,
  fromStatus: currentTask.status,
  toStatus: validation.data.status,
});

  revalidatePath("/app/ops");
  revalidatePath("/app/ops/tasks");

  redirect("/app/ops/tasks?updated=1");
}