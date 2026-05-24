import { createOpsTaskAction } from "@/modules/ops/server/ops.actions";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

export default function OpsCreateTaskForm() {
  return (
    <form action={createOpsTaskAction} style={ui.card.base}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
        Crea task rapido
      </h3>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <input
          name="title"
          type="text"
          placeholder="Titolo task"
          required
          maxLength={120}
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 14,
          }}
        />

        <textarea
          name="description"
          placeholder="Descrizione opzionale"
          maxLength={500}
          rows={3}
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 14,
            resize: "vertical",
          }}
        />

        <select
          name="priority"
          defaultValue="medium"
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 14,
            background: "#ffffff",
          }}
        >
          <option value="low">Bassa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        <button type="submit" style={ui.button.primary}>
          Crea task
        </button>
      </div>
    </form>
  );
}