import type {
  OpsAttentionItem,
  OpsAttentionSummary,
} from "@/modules/ops/domain/ops.attention";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";
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
      <div style={ui.card.base}>
        <h2 style={ui.page.sectionTitle}>Operational Attention</h2>
        <p style={{ marginTop: 10, color: theme.colors.textMuted }}>
          Tutto stabile. Nessun elemento operativo richiede attenzione.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={ui.page.sectionTitle}>Operational Attention</h2>
        <p style={{ marginTop: 8, color: theme.colors.textMuted }}>
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