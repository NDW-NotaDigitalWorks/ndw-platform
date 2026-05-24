import type { OpsActivityFeedItemViewModel } from "@/modules/ops/domain/ops.view-models";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

type Props = {
  items: OpsActivityFeedItemViewModel[];
};

export default function OpsActivityFeed({ items }: Props) {
  return (
    <div style={ui.card.base}>
      <h2 style={ui.page.sectionTitle}>Activity Feed</h2>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: 14,
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