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

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 22,
};

const stopCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 16,
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

function getStatusLabel(status: string): string {
  if (status === "valid") return "Verified";
  if (status === "needs_review") return "Needs review";
  if (status === "raw") return "Raw";
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Skipped";
  return status;
}

export default async function RouteProReviewPage({ params }: Props) {
  const { routeId } = await params;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;
  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const needsReviewStops = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;
  const rawStops = route.stops.filter((stop) => stop.status === "raw").length;

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Review"
      title="Review stops"
      subtitle={`${totalStops} stops extracted from your route. Check them before verifying addresses.`}
    >
      <div style={gridStyle}>
        <article style={stopCardStyle}>
          <p style={ui.page.eyebrow}>Extracted stops</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={stopCardStyle}>
          <p style={ui.page.eyebrow}>Verified</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{validStops}</h2>
        </article>

        <article style={stopCardStyle}>
          <p style={ui.page.eyebrow}>Need review</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{needsReviewStops}</h2>
        </article>

        <article style={stopCardStyle}>
          <p style={ui.page.eyebrow}>Raw</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{rawStops}</h2>
        </article>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Extracted stop list</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              No stops imported yet. Go back to the classic route view and import
              screenshots, a list or a CSV.
            </p>

            <div style={{ marginTop: 16 }}>
              <Link href={`/app/routepro/${route.id}`} style={routeProUi.primaryButton}>
                Import stops
              </Link>
            </div>
          </div>
        ) : (
          <div style={listStyle}>
            {route.stops.map((stop) => (
              <article key={stop.id} style={stopCardStyle}>
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
                      Original stop {stop.original_position} · Workflow position{" "}
                      {stop.position}
                    </strong>

                    <p style={mutedTextStyle}>{stop.address}</p>

                    {stop.source ? (
                      <p style={mutedTextStyle}>Source: {stop.source}</p>
                    ) : null}
                  </div>

                  <span style={badgeStyle}>{getStatusLabel(stop.status)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        <Link href={`/app/routepro/routes/${route.id}/verify`} style={routeProUi.primaryButton}>
          Continue to verify
        </Link>

        <Link href={`/app/routepro/${route.id}`} style={routeProUi.secondaryButton}>
          Edit in classic view
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}