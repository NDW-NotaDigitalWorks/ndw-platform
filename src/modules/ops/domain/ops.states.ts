export type OpsAreaStatus = "active" | "planned" | "locked";

export type OpsEntityStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type OpsPriority = "low" | "medium" | "high" | "urgent";

export const OPS_AREA_STATUSES = {
  active: "active",
  planned: "planned",
  locked: "locked",
} as const;

export const OPS_ENTITY_STATUSES = {
  draft: "draft",
  active: "active",
  paused: "paused",
  completed: "completed",
  archived: "archived",
} as const;

export const OPS_PRIORITIES = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
} as const;