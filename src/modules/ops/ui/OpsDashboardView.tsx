import type { OpsWorkspaceDashboardViewModel } from "@/modules/ops/domain/ops.view-models";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import OpsModuleShell from "./OpsModuleShell";
import OpsSectionCard from "./components/OpsSectionCard";
import OpsMetricCard from "./components/OpsMetricCard";
import OpsResponsiveGrid from "./components/OpsResponsiveGrid";
import OpsInsightCard from "./components/OpsInsightCard";
import OpsActivityFeed from "./components/OpsActivityFeed";
import OpsAttentionPanel from "./components/OpsAttentionPanel";

type Props = {
  workspace: OpsWorkspaceDashboardViewModel;
};

export default function OpsDashboardView({ workspace }: Props) {
  return (
    <OpsModuleShell>
      <section>
        <OpsResponsiveGrid
          minColumnWidth={220}
          gap={ndwTokens.spacing.lg}
        >
          {workspace.metrics.map((metric) => (
            <OpsMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </OpsResponsiveGrid>
      </section>

      {workspace.attentionItems.length > 0 ? (
        <section
          style={{
            marginTop: ndwTokens.spacing["2xl"],
          }}
        >
          <OpsAttentionPanel
            summary={workspace.attentionSummary}
            primaryItems={workspace.primaryAttentionItems}
            secondaryItems={workspace.secondaryAttentionItems}
          />
        </section>
      ) : null}

      {workspace.insights.length > 0 ? (
        <section
          style={{
            marginTop: ndwTokens.spacing["2xl"],
          }}
        >
          <OpsResponsiveGrid
            minColumnWidth={260}
            gap={ndwTokens.spacing.lg}
          >
            {workspace.insights.map((insight) => (
              <OpsInsightCard
                key={insight.title}
                insight={insight}
              />
            ))}
          </OpsResponsiveGrid>
        </section>
      ) : null}

      <section
        style={{
          marginTop: ndwTokens.spacing["2xl"],
        }}
      >
        <OpsActivityFeed items={workspace.activityFeed} />
      </section>

      <section
        style={{
          marginTop: ndwTokens.spacing["3xl"],
        }}
      >
        <OpsResponsiveGrid
          minColumnWidth={260}
          gap={ndwTokens.spacing.lg}
        >
          {workspace.areas.map((area) => (
            <OpsSectionCard
              key={area.key}
              area={area}
            />
          ))}
        </OpsResponsiveGrid>
      </section>
    </OpsModuleShell>
  );
}