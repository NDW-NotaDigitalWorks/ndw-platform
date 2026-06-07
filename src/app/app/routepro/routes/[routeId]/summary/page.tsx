import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { buildDeliveryClusters } from "@/modules/routepro/v2/domain/routepro.clusters";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const cardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 16,
};

const metricCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 20,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#475569",
};

const metricValueStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 38,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const metricHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 700,
  color: "#334155",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 22,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  background: "#f1f5f9",
  color: "#334155",
};

const summaryPanelStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 24,
  padding: 22,
  border: "1px solid #cbd5e1",
  background:
    "linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)",
};

const healthBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 13,
  fontWeight: 900,
};

const stopHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const stopNumberGroupStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const originalStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 900,
};

const optimizedStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
};

function getCompletionRate(doneCount: number, totalStops: number): number {
  if (totalStops === 0) return 0;
  return Math.round((doneCount / totalStops) * 100);
}

function getStatusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Skipped";
  if (status === "valid") return "Remaining";
  if (status === "needs_review") return "Needs review";
  if (status === "raw") return "Waiting verification";
  return status;
}

function getRouteHealthLabel(
  completionRate: number,
  remainingCount: number,
  needsReviewCount: number,
): string {
  if (needsReviewCount > 0) return "Needs attention";
  if (remainingCount === 0 && completionRate === 100) return "Completed";
  if (completionRate >= 80) return "On track";
  if (completionRate > 0) return "In progress";
  return "Not started";
}

export default async function RouteProSummaryPage({ params }: Props) {
  const { routeId } = await params;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;
  const completedStops = route.stops.filter((stop) => stop.status === "completed");
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped");
  const needsReviewStops = route.stops.filter((stop) => stop.status === "needs_review");
  const remainingStops = route.stops.filter(
    (stop) =>
      stop.status !== "completed" &&
      stop.status !== "skipped",
  );

  const clusters = buildDeliveryClusters(route.stops);
  const deliveryClusters = clusters.filter((cluster) => cluster.stops.length > 1);
  const clusteredStopsCount = deliveryClusters.reduce(
    (total, cluster) => total + cluster.stops.length,
    0,
  );

  const doneCount = completedStops.length + skippedStops.length;
  const completionRate = getCompletionRate(doneCount, totalStops);
  const routeHealth = getRouteHealthLabel(
    completionRate,
    remainingStops.length,
    needsReviewStops.length,
  );

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Summary"
      title="Daily summary"
      subtitle={`You handled ${doneCount} of ${totalStops} stops in this delivery workflow.`}
    >
      <div style={gridStyle}>
        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Total stops</p>
          <h2 style={metricValueStyle}>{totalStops}</h2>
          <p style={metricHintStyle}>Stops imported into this route.</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Completed</p>
          <h2 style={metricValueStyle}>{completedStops.length}</h2>
          <p style={metricHintStyle}>Stops completed during the workflow.</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Skipped</p>
          <h2 style={metricValueStyle}>{skippedStops.length}</h2>
          <p style={metricHintStyle}>Stops skipped during execution.</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Completion rate</p>
          <h2 style={metricValueStyle}>{completionRate}%</h2>
          <p style={metricHintStyle}>Handled stops over total stops.</p>
        </article>
      </div>

      <div style={gridStyle}>
        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Clusters</p>
          <h2 style={metricValueStyle}>{deliveryClusters.length}</h2>
          <p style={metricHintStyle}>Locations with multiple deliveries.</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Clustered stops</p>
          <h2 style={metricValueStyle}>{clusteredStopsCount}</h2>
          <p style={metricHintStyle}>Stops grouped by same delivery location.</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Optimization</p>
          <h2 style={metricValueStyle}>{route.is_optimized ? "Yes" : "No"}</h2>
          <p style={metricHintStyle}>
            {route.is_optimized
              ? "RoutePro optimization has been applied."
              : "Optimization has not been applied yet."}
          </p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Needs review</p>
          <h2 style={metricValueStyle}>{needsReviewStops.length}</h2>
          <p style={metricHintStyle}>Stops that still need manual correction.</p>
        </article>
      </div>

      <div style={summaryPanelStyle}>
        <h2 style={ui.page.sectionTitle}>Route health</h2>

        <div style={{ marginTop: 12 }}>
          <span style={healthBadgeStyle}>{routeHealth}</span>
        </div>

        <p style={mutedTextStyle}>
          Route status: <strong>{route.status}</strong>
        </p>

        <p style={mutedTextStyle}>
          Remaining stops: <strong>{remainingStops.length}</strong>
        </p>

        <p style={mutedTextStyle}>
          Original stop numbers were preserved throughout the workflow.
        </p>

        <p style={mutedTextStyle}>
          Delivery clusters detected: <strong>{deliveryClusters.length}</strong>
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Stop outcome list</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>No stops available for this summary.</p>
          </div>
        ) : (
          <div style={listStyle}>
            {route.stops.map((stop) => (
              <article key={stop.id} style={cardStyle}>
                <div style={stopHeaderStyle}>
                  <div>
                    <div style={stopNumberGroupStyle}>
                      <span style={originalStopBadgeStyle}>
                        STOP #{stop.original_position}
                      </span>

                      <span style={optimizedStopBadgeStyle}>
                        OPT #{stop.position}
                      </span>
                    </div>

                    <p style={mutedTextStyle}>{stop.address}</p>
                  </div>

                  <span style={badgeStyle}>{getStatusLabel(stop.status)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        <Link href={`/app/routepro/routes/${route.id}/drive`} style={routeProUi.secondaryButton}>
          Back to drive
        </Link>

        <Link href={`/app/routepro/${route.id}`} style={routeProUi.secondaryButton}>
          Classic route view
        </Link>

        <Link href="/app/routepro" style={routeProUi.primaryButton}>
          Command Center
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}
