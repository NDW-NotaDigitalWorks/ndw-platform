import { updateOpsTaskStatusAction } from "@/modules/ops/server/ops.actions";
import type { OpsEntityStatus } from "@/modules/ops/domain/ops.states";
import type { OpsEntityCardViewModel } from "@/modules/ops/domain/ops.view-models";
import OpsSubmitActionButton from "./OpsSubmitActionButton";

type Props = {
  entity: OpsEntityCardViewModel;
};

type TaskStatusAction = {
  status: OpsEntityStatus;
  label: string;
};

const ACTIONS_BY_STATUS: Record<string, TaskStatusAction[]> = {
  draft: [
    { status: "active", label: "Attiva" },
    { status: "paused", label: "Pausa" },
    { status: "completed", label: "Completa" },
    { status: "archived", label: "Archivia" },
  ],
  active: [
    { status: "paused", label: "Pausa" },
    { status: "completed", label: "Completa" },
    { status: "archived", label: "Archivia" },
  ],
  paused: [
    { status: "active", label: "Riattiva" },
    { status: "completed", label: "Completa" },
    { status: "archived", label: "Archivia" },
  ],
  completed: [
    { status: "active", label: "Riattiva" },
    { status: "archived", label: "Archivia" },
  ],
  archived: [],
};

function StatusActionForm({
  id,
  status,
  label,
}: {
  id: string;
  status: OpsEntityStatus;
  label: string;
}) {
  return (
    <form action={updateOpsTaskStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />

      <OpsSubmitActionButton label={label} />
    </form>
  );
}

export default function OpsTaskStatusActions({ entity }: Props) {
  if (entity.entityType !== "task") {
    return null;
  }

  const actions = ACTIONS_BY_STATUS[entity.status] ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {actions.map((action) => (
        <StatusActionForm
          key={action.status}
          id={entity.id}
          status={action.status}
          label={action.label}
        />
      ))}
    </div>
  );
}