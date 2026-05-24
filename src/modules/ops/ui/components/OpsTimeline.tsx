import type { OpsTimelineItemViewModel } from "@/modules/ops/domain/ops.view-models";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

type Props = {
  items: OpsTimelineItemViewModel[];
};

export default function OpsTimeline({ items }: Props) {
  if (items.length === 0) {
    return (
      <div style={ui.card.base}>
        <h2 style={ui.page.sectionTitle}>Timeline</h2>
        <p style={{ marginTop: 10, color: theme.colors.textMuted }}>
          Nessuna attività registrata per questo item.
        </p>
      </div>
    );
  }

  return (
    <div style={ui.card.base}>
      <h2 style={ui.page.sectionTitle}>Timeline</h2>

      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              borderLeft: `3px solid ${theme.colors.primary}`,
              paddingLeft: 14,
            }}
          >
            <strong>{item.title}</strong>

            <p
              style={{
                marginTop: 6,
                color: theme.colors.textMuted,
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </p>

            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                color: theme.colors.textMuted,
              }}
            >
              {item.timestampLabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}