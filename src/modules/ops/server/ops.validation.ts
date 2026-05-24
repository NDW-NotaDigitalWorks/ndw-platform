import type {
  CreateOpsTaskInput,
  UpdateOpsTaskStatusInput,
} from "@/modules/ops/domain/ops.inputs";
import type { OpsPriority } from "@/modules/ops/domain/ops.states";

const ALLOWED_PRIORITIES: OpsPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export type OpsValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function isOpsPriority(value: string): value is OpsPriority {
  return ALLOWED_PRIORITIES.includes(value as OpsPriority);
}

export function validateCreateOpsTaskFormData(
  formData: FormData,
): OpsValidationResult<CreateOpsTaskInput> {
  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const priorityValue = normalizeText(formData.get("priority"));

  if (!title) {
    return {
      ok: false,
      error: "Il titolo del task è obbligatorio.",
    };
  }

  if (title.length > 120) {
    return {
      ok: false,
      error: "Il titolo non può superare 120 caratteri.",
    };
  }

  if (description.length > 500) {
    return {
      ok: false,
      error: "La descrizione non può superare 500 caratteri.",
    };
  }

  if (!isOpsPriority(priorityValue)) {
    return {
      ok: false,
      error: "Priorità non valida.",
    };
  }

  return {
    ok: true,
    data: {
      title,
      description: description || null,
      priority: priorityValue,
      dueAt: null,
    },
  };
}

export function validateUpdateOpsTaskStatusFormData(
  formData: FormData,
): OpsValidationResult<UpdateOpsTaskStatusInput> {
  const id = normalizeText(formData.get("id"));
  const statusValue = normalizeText(formData.get("status"));

  if (!id) {
    return {
      ok: false,
      error: "ID task mancante.",
    };
  }

  const allowedStatuses = [
    "draft",
    "active",
    "paused",
    "completed",
    "archived",
  ];

  if (!allowedStatuses.includes(statusValue)) {
    return {
      ok: false,
      error: "Status task non valido.",
    };
  }

  return {
    ok: true,
    data: {
      id,
      status: statusValue as UpdateOpsTaskStatusInput["status"],
    },
  };
}