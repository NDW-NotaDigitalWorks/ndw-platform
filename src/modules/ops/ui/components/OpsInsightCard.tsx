import type { OpsDashboardInsightViewModel } from "@/modules/ops/domain/ops.view-models";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type Props = {
  insight: OpsDashboardInsightViewModel;
};

function getToneStyle(tone: OpsDashboardInsightViewModel["tone"]) {
  switch (tone) {
    case "success":
      return {
        border: `1px solid ${ndwTokens.colors.success}`,
        background: ndwTokens.colors.successSoft,
        titleColor: "#86EFAC",
      };
    case "warning":
      return {
        border: `1px solid ${ndwTokens.colors.warning}`,
        background: ndwTokens.colors.warningSoft,
        titleColor: "#FBBF24",
      };
    case "muted":
      return {
        border: `1px solid ${ndwTokens.colors.borderStrong}`,
        background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
        titleColor: ndwTokens.colors.textPrimary,
      };
  }
}

export default function OpsInsightCard({ insight }: Props) {
  const toneStyle = getToneStyle(insight.tone);

  return (
    <div
      style={{
        padding: ndwTokens.spacing.xl,
        borderRadius: ndwTokens.radius["2xl"],
        border: toneStyle.border,
        background: toneStyle.background,
        boxShadow: ndwTokens.shadows.sm,
      }}
    >
      <h3
        style={{
          margin: 0,
          color: toneStyle.titleColor,
          fontSize: ndwTokens.typography.sizes.cardTitle,
          fontWeight: ndwTokens.typography.weights.black,
          lineHeight: ndwTokens.typography.lineHeights.snug,
        }}
      >
        {insight.title}
      </h3>

      <p
        style={{
          margin: "10px 0 0",
          color: ndwTokens.colors.textSecondary,
          fontSize: ndwTokens.typography.sizes.body,
          lineHeight: ndwTokens.typography.lineHeights.normal,
        }}
      >
        {insight.description}
      </p>
    </div>
  );
}