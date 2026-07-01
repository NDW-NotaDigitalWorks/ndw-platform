import Link from "next/link";
import { notFound } from "next/navigation";
import { geocodeRouteProStops } from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import { RouteProVerifyStopsClient } from "@/modules/routepro/ui/RouteProVerifyStopsClient";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    geocoded?: string;
    error?: string;
  }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const cardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const valueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 950,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 950,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.6,
  fontWeight: 700,
};

const emptyCardStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.26)",
  boxShadow: "0 16px 36px rgba(15,23,42,0.12)",
};

const emptyTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#e2e8f0",
  fontSize: 15,
  lineHeight: 1.55,
  fontWeight: 700,
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf5",
  color: "#047857",
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 700,
};

function getErrorMessage(error?: string): string | null {
  if (error === "geocode-failed") {
    return "Address verification failed. Check your API settings and try again.";
  }

  return null;
}

export default async function RouteProVerifyPage({
  params,
  searchParams,
}: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;
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
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Verify"
      title="Verify addresses"
      subtitle={`${validStops} of ${totalStops} stops are verified. Confirm addresses before optimizing.`}
    >
      {resolvedSearchParams?.geocoded === "1" ? (
        <div style={successStyle}>
          Address verification completed. Review any stop marked as needs
          correction.
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={labelStyle}>Total stops</p>
          <h2 style={valueStyle}>{totalStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Verified</p>
          <h2 style={valueStyle}>{validStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Need correction</p>
          <h2 style={valueStyle}>{needsReviewStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Waiting</p>
          <h2 style={valueStyle}>{rawStops}</h2>
        </article>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Address verification</h2>
        <p style={mutedTextStyle}>
          RoutePro checks each stop and marks addresses that need correction
          before optimization.
        </p>

        <form action={geocodeRouteProStops} style={{ marginTop: 18 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <RouteProSubmitButton
            idleLabel="Verify addresses"
            pendingLabel="Verifying addresses..."
          />
        </form>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Verification status</h2>

        {route.stops.length === 0 ? (
          <div style={emptyCardStyle}>
            <p style={emptyTextStyle}>
              No stops available yet. Import stops before verifying addresses.
            </p>
          </div>
        ) : (
          <RouteProVerifyStopsClient stops={route.stops} />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}
      >
        <Link
          href={`/app/routepro/routes/${route.id}/optimize`}
          style={routeProUi.primaryButton}
        >
          Continue to optimize
        </Link>

        <Link
          href={`/app/routepro/routes/${route.id}/review`}
          style={routeProUi.secondaryButton}
        >
          Back to review
        </Link>

        <Link
          href={`/app/routepro/${route.id}`}
          style={routeProUi.secondaryButton}
        >
          Edit in classic view
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}