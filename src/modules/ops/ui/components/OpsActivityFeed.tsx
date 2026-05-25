import type { OpsActivityFeedItemViewModel } from "@/modules/ops/domain/ops.view-models";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type Props = {
  items: OpsActivityFeedItemViewModel[];
};

export default function OpsActivityFeed({ items }: Props) {
  return (
    <div
      style={{
        padding: ndwTokens.spacing.xl,
        borderRadius: ndwTokens.radius["2xl"],
        border: `1px solid ${ndwTokens.colors.border}`,
        background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
        boxShadow: ndwTokens.shadows.sm,
      }}
    >
      <h2
        style={{
          margin: 0,
          color: ndwTokens.colors.textPrimary,
          fontSize: ndwTokens.typography.sizes.sectionTitle,
          fontWeight: ndwTokens.typography.weights.black,
        }}
      >
        Activity Feed
      </h2>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              borderTop: `1px solid ${ndwTokens.colors.borderStrong}`,
              paddingTop: 14,
            }}
          >
            <strong
              style={{
                color: ndwTokens.colors.textPrimary,
                fontSize: ndwTokens.typography.sizes.body,
                fontWeight: ndwTokens.typography.weights.black,
              }}
            >
              {item.title}
            </strong>

            <p
              style={{
                margin: "6px 0 0",
                color: ndwTokens.colors.textSecondary,
                fontSize: ndwTokens.typography.sizes.body,
                lineHeight: ndwTokens.typography.lineHeights.normal,
              }}
            >
              {item.description}
            </p>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: ndwTokens.typography.sizes.caption,
                color: ndwTokens.colors.textMuted,
                fontWeight: ndwTokens.typography.weights.medium,
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