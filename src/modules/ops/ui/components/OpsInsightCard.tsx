import type { OpsDashboardInsightViewModel } from "@/modules/ops/domain/ops.view-models";
import { ui } from "@/styles/ui";

type Props = {
  insight: OpsDashboardInsightViewModel;
};

function getToneStyle(tone: OpsDashboardInsightViewModel["tone"]) {
  switch (tone) {
    case "success":
      return {
        border: "1px solid #bbf7d0",
        background: "#f0fdf4",
        color: "#166534",
      };
    case "warning":
      return {
        border: "1px solid #fcd34d",
        background: "#fffbeb",
        color: "#92400e",
      };
    case "muted":
      return {
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        color: "#374151",
      };
  }
}

export default function OpsInsightCard({ insight }: Props) {
  const toneStyle = getToneStyle(insight.tone);

  return (
    <div
      style={{
        ...ui.card.base,
        ...toneStyle,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        {insight.title}
      </h3>

      <p
        style={{
          marginTop: 10,
          lineHeight: 1.7,
        }}
      >
        {insight.description}
      </p>
    </div>
  );
}