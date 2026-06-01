import Link from "next/link";
import { notFound } from "next/navigation";
import { geocodeRouteProStops } from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { ui } from "@/styles/ui";

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

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 22,
};

const cardStyle: React.CSSProperties = {
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

function getVerifyLabel(status: string): string {
  if (status === "valid") return "Verified";
  if (status === "needs_review") return "Needs correction";
  if (status === "raw") return "Waiting verification";
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Skipped";
  return status;
}

function getErrorMessage(error?: string): string | null {
  if (error === "geocode-failed") {
    return "Address verification failed. Check your API settings and try again.";
  }

  return null;
}

export default async function RouteProVerifyPage({ params, searchParams }: Props) {
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
          Address verification completed. Review any stop marked as needs correction.
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Total stops</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Verified</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{validStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Need correction</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{needsReviewStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Waiting</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{rawStops}</h2>
        </article>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Address verification</h2>
        <p style={mutedTextStyle}>
          RoutePro checks each stop and marks addresses that need correction before
          optimization.
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
        <h2 style={ui.page.sectionTitle}>Verification status</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              No stops available yet. Import stops before verifying addresses.
            </p>
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
                      Original stop {stop.original_position} · Workflow position{" "}
                      {stop.position}
                    </strong>

                    <p style={mutedTextStyle}>{stop.address}</p>

                    {stop.lat && stop.lng ? (
                      <p style={mutedTextStyle}>
                        Coordinates: {stop.lat}, {stop.lng}
                      </p>
                    ) : (
                      <p style={mutedTextStyle}>Coordinates: waiting verification</p>
                    )}
                  </div>

                  <span style={badgeStyle}>{getVerifyLabel(stop.status)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
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

        <Link href={`/app/routepro/${route.id}`} style={routeProUi.secondaryButton}>
          Edit in classic view
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}