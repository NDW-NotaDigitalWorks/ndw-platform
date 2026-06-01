import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
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
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: "#f1f5f9",
  color: "#334155",
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

export default async function RouteProSummaryPage({ params }: Props) {
  const { routeId } = await params;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;
  const completedStops = route.stops.filter((stop) => stop.status === "completed");
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped");
  const remainingStops = route.stops.filter(
    (stop) =>
      stop.status !== "completed" &&
      stop.status !== "skipped",
  );

  const doneCount = completedStops.length + skippedStops.length;
  const completionRate = getCompletionRate(doneCount, totalStops);

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Summary"
      title="Daily summary"
      subtitle={`You handled ${doneCount} of ${totalStops} stops in this delivery workflow.`}
    >
      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Total stops</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Completed</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {completedStops.length}
          </h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Skipped</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {skippedStops.length}
          </h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Completion rate</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {completionRate}%
          </h2>
        </article>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Delivery day status</h2>
        <p style={mutedTextStyle}>
          Route status: <strong>{route.status}</strong>
        </p>
        <p style={mutedTextStyle}>
          Remaining stops: <strong>{remainingStops.length}</strong>
        </p>
        <p style={mutedTextStyle}>
          Original stop numbers were preserved throughout the workflow.
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <strong>
                      Workflow stop {stop.position} · Original stop{" "}
                      {stop.original_position}
                    </strong>

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