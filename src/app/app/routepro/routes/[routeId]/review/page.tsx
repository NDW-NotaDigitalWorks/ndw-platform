import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { RouteProReviewStopsClient } from "@/modules/routepro/ui/RouteProReviewStopsClient";

type Props = {
  params: Promise<{ routeId: string }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const metricCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const metricValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 950,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 22,
};

const stopCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.26)",
  boxShadow: "0 16px 36px rgba(15,23,42,0.12)",
};

const stopTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 900,
};

const addressStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#e2e8f0",
  fontSize: 15,
  lineHeight: 1.55,
  fontWeight: 700,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 700,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 950,
};

function getStatusLabel(status: string): string {
  if (status === "valid") return "Verified";
  if (status === "needs_review") return "Needs review";
  if (status === "raw") return "Raw";
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Skipped";
  return status;
}

function getBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  };

  if (status === "valid") {
    return {
      ...base,
      background: "rgba(34,197,94,0.16)",
      color: "#bbf7d0",
      border: "1px solid rgba(34,197,94,0.35)",
    };
  }

  if (status === "needs_review") {
    return {
      ...base,
      background: "rgba(245,158,11,0.16)",
      color: "#fde68a",
      border: "1px solid rgba(245,158,11,0.35)",
    };
  }

  return {
    ...base,
    background: "rgba(59,130,246,0.16)",
    color: "#bfdbfe",
    border: "1px solid rgba(59,130,246,0.35)",
  };
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
        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Extracted stops</p>
          <h2 style={metricValueStyle}>{totalStops}</h2>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Verified</p>
          <h2 style={metricValueStyle}>{validStops}</h2>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Need review</p>
          <h2 style={metricValueStyle}>{needsReviewStops}</h2>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Raw</p>
          <h2 style={metricValueStyle}>{rawStops}</h2>
        </article>
      </div>

      <div style={{ marginTop: 28 }}>
  <h2 style={sectionTitleStyle}>Review Route</h2>

  {route.stops.length === 0 ? (
    <div style={{ ...stopCardStyle, marginTop: 18 }}>
      <p style={addressStyle}>
        No stops imported yet. Go back to the classic route view and import
        screenshots, a list or a CSV.
      </p>

      <div style={{ marginTop: 16 }}>
        <Link
          href={`/app/routepro/${route.id}`}
          style={routeProUi.primaryButton}
        >
          Import stops
        </Link>
      </div>
    </div>
  ) : (
    <RouteProReviewStopsClient stops={route.stops} />
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