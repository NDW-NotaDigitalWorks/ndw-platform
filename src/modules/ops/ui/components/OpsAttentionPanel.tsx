import type {
  OpsAttentionItem,
  OpsAttentionSummary,
} from "@/modules/ops/domain/ops.attention";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import OpsAttentionBlock from "./OpsAttentionBlock";
import OpsResponsiveGrid from "./OpsResponsiveGrid";

type Props = {
  summary: OpsAttentionSummary;
  primaryItems: OpsAttentionItem[];
  secondaryItems: OpsAttentionItem[];
};

export default function OpsAttentionPanel({
  summary,
  primaryItems,
  secondaryItems,
}: Props) {
  if (summary.healthy) {
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
          Operational Attention
        </h2>

        <p
          style={{
            margin: "10px 0 0",
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.body,
            lineHeight: ndwTokens.typography.lineHeights.normal,
          }}
        >
          Tutto stabile. Nessun elemento operativo richiede attenzione.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: ndwTokens.spacing.lg }}>
        <h2
          style={{
            margin: 0,
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.sectionTitle,
            fontWeight: ndwTokens.typography.weights.black,
          }}
        >
          Operational Attention
        </h2>

        <p
          style={{
            margin: "8px 0 0",
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.body,
            lineHeight: ndwTokens.typography.lineHeights.normal,
          }}
        >
          {summary.total} segnali rilevati — {summary.warning} warning,{" "}
          {summary.info} info.
        </p>
      </div>

      {primaryItems.length > 0 ? (
        <OpsResponsiveGrid minColumnWidth={260} gap={14}>
          {primaryItems.map((item) => (
            <OpsAttentionBlock
              key={item.id}
              title={item.title}
              description={item.description}
            />
          ))}
        </OpsResponsiveGrid>
      ) : null}

      {secondaryItems.length > 0 ? (
        <div style={{ marginTop: primaryItems.length > 0 ? 18 : 0 }}>
          <OpsResponsiveGrid minColumnWidth={260} gap={14}>
            {secondaryItems.map((item) => (
              <OpsAttentionBlock
                key={item.id}
                title={item.title}
                description={item.description}
              />
            ))}
          </OpsResponsiveGrid>
        </div>
      ) : null}
    </div>
  );
}