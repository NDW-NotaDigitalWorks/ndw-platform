import type { OpsEntityStatus } from "./ops.states";

export function canTransitionOpsStatus(
  from: OpsEntityStatus,
  to: OpsEntityStatus,
): boolean {
  if (from === to) {
    return true;
  }

  if (from === "archived") {
    return false;
  }

  const allowedTransitions: Record<OpsEntityStatus, OpsEntityStatus[]> = {
    draft: ["active", "paused", "completed", "archived"],
    active: ["paused", "completed", "archived"],
    paused: ["active", "completed", "archived"],
    completed: ["active", "archived"],
    archived: [],
  };

  return allowedTransitions[from].includes(to);
}