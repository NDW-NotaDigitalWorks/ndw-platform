import Link from "next/link";
import { notFound } from "next/navigation";
import {
  completeRouteProRoute,
  completeRouteProStop,
  skipRouteProStop,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { getClusterStopsForCurrentStop } from "@/modules/routepro/v2/domain/routepro.clusters";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    completed?: string;
    skipped?: string;
    routeCompleted?: string;
  }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
  marginTop: 18,
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

const bigStopNumberStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 64,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-2px",
};

const addressStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: 26,
  lineHeight: 1.3,
  fontWeight: 900,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18,
};

const mobileActionsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginTop: 18,
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

const progressTrackStyle: React.CSSProperties = {
  height: 12,
  borderRadius: 999,
  background: "#e5e7eb",
  overflow: "hidden",
  marginTop: 14,
};

const bottomBarStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
  padding: "12px 16px",
  background: "rgba(255, 255, 255, 0.96)",
  borderTop: "1px solid #e5e7eb",
  boxShadow: "0 -10px 30px rgba(15, 23, 42, 0.12)",
};

const bottomBarInnerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  maxWidth: 720,
  margin: "0 auto",
};

function getProgressFillStyle(progress: number): React.CSSProperties {
  return {
    height: "100%",
    width: `${progress}%`,
    borderRadius: 999,
    background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  };
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

function getErrorMessage(error?: string): string | null {
  if (error === "complete-failed") return "Stop completion failed. Try again.";
  if (error === "skip-failed") return "Stop skip failed. Try again.";
  if (error === "route-complete-failed") return "Route completion failed. Try again.";
  return null;
}

function getProgressPercent(doneCount: number, totalStops: number): number {
  if (totalStops === 0) return 0;
  return Math.round((doneCount / totalStops) * 100);
}

export default async function RouteProDrivePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const completedStops = route.stops.filter((stop) => stop.status === "completed");
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped");
  const executableStops = route.stops.filter(
    (stop) => stop.status === "valid" && stop.lat !== null && stop.lng !== null,
  );

  const currentStop = executableStops[0];
  const nextStop = executableStops[1];

  const currentStopLat = currentStop?.lat ?? null;
  const currentStopLng = currentStop?.lng ?? null;

  const currentClusterStops = getClusterStopsForCurrentStop(
    currentStop,
    route.stops,
  );
  const isClusteredDelivery = currentClusterStops.length > 1;

  const totalStops = route.stops.length;
  const doneCount = completedStops.length + skippedStops.length;
  const remainingCount = executableStops.length;
  const progressPercent = getProgressPercent(doneCount, totalStops);
  const isRouteCompleted = route.status === "completed";

  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  const showBottomBar =
    !isRouteCompleted &&
    currentStop !== undefined &&
    currentStopLat !== null &&
    currentStopLng !== null;

  return (
    <div style={{ paddingBottom: showBottomBar ? 110 : 0 }}>
      <RouteProWorkflowShell
        routeId={routeId}
        currentStep="Drive"
        title="Drive route"
        subtitle="Navigate, complete and manage your delivery workflow stop by stop."
      >
        {resolvedSearchParams?.completed === "1" ? (
          <div style={successStyle}>Stop completed. Move to the next delivery.</div>
        ) : null}

        {resolvedSearchParams?.skipped === "1" ? (
          <div style={successStyle}>Stop skipped. Continue your workflow.</div>
        ) : null}

        {resolvedSearchParams?.routeCompleted === "1" ? (
          <div style={successStyle}>Route completed successfully.</div>
        ) : null}

        {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

        <div style={{ ...ui.card.base, marginTop: 18 }}>
          <p style={ui.page.eyebrow}>Driver progress</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {progressPercent}% completed
          </h2>

          <div style={progressTrackStyle}>
            <div style={getProgressFillStyle(progressPercent)} />
          </div>

          <p style={mutedTextStyle}>
            {doneCount} handled · {remainingCount} ready to drive · {totalStops} total stops
          </p>
        </div>

        <div style={gridStyle}>
          <article style={cardStyle}>
            <p style={ui.page.eyebrow}>Handled</p>
            <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
              {doneCount}/{totalStops}
            </h2>
          </article>

          <article style={cardStyle}>
            <p style={ui.page.eyebrow}>Remaining</p>
            <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{remainingCount}</h2>
          </article>

          <article style={cardStyle}>
            <p style={ui.page.eyebrow}>Skipped</p>
            <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
              {skippedStops.length}
            </h2>
          </article>
        </div>

        {isRouteCompleted ? (
          <div style={{ ...ui.card.base, marginTop: 24 }}>
            <h2 style={ui.page.sectionTitle}>Route completed</h2>
            <p style={mutedTextStyle}>
              You handled {doneCount} stops out of {totalStops}.
            </p>

            <div style={actionsStyle}>
              <Link
                href={`/app/routepro/routes/${route.id}/summary`}
                style={routeProUi.primaryButton}
              >
                View summary
              </Link>
            </div>
          </div>
        ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
          <div style={{ ...ui.card.base, marginTop: 24 }}>
            <h2 style={ui.page.sectionTitle}>No more verified stops</h2>
            <p style={mutedTextStyle}>
              Complete the route when your delivery workflow is finished.
            </p>

            <form action={completeRouteProRoute} style={{ marginTop: 18 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <button
                type="submit"
                style={{
                  ...routeProUi.primaryButton,
                  width: "100%",
                  padding: "18px",
                  fontSize: 18,
                  borderRadius: 14,
                }}
              >
                Complete route
              </button>
            </form>
          </div>
        ) : (
          <>
            <div style={{ ...ui.card.base, marginTop: 24 }}>
              <p style={ui.page.eyebrow}>Current delivery</p>

              <div style={bigStopNumberStyle}>#{currentStop.position}</div>

              <p style={mutedTextStyle}>
                Original stop: <strong>{currentStop.original_position}</strong>
              </p>

              {isClusteredDelivery ? (
                <div
                  style={{
                    ...ui.card.base,
                    marginTop: 16,
                    padding: 14,
                    background: "#f8fafc",
                  }}
                >
                  <p style={ui.page.eyebrow}>Clustered delivery</p>

                  <p style={mutedTextStyle}>
                    Original stops:{" "}
                    <strong>
                      {currentClusterStops
                        .map((stop) => stop.original_position)
                        .join(" • ")}
                    </strong>
                  </p>

                  <p style={mutedTextStyle}>
                    Stops/packages here: <strong>{currentClusterStops.length}</strong>
                  </p>
                </div>
              ) : null}

              <div style={addressStyle}>{currentStop.address}</div>

              <div style={mobileActionsStyle}>
                <a
                  href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...routeProUi.primaryButton,
                    padding: "18px",
                    fontSize: 17,
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  Open Google Maps
                </a>

                <a
                  href={getWazeUrl(currentStopLat, currentStopLng)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...routeProUi.secondaryButton,
                    padding: "18px",
                    fontSize: 17,
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  Open Waze
                </a>
              </div>

              <div style={mobileActionsStyle}>
                <form action={completeRouteProStop}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={currentStop.id} />

                  <button
                    type="submit"
                    style={{
                      ...routeProUi.primaryButton,
                      width: "100%",
                      padding: "20px",
                      fontSize: 18,
                      borderRadius: 16,
                    }}
                  >
                    Complete stop
                  </button>
                </form>

                <form action={skipRouteProStop}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={currentStop.id} />

                  <button
                    type="submit"
                    style={{
                      ...routeProUi.secondaryButton,
                      width: "100%",
                      padding: "20px",
                      fontSize: 18,
                      borderRadius: 16,
                    }}
                  >
                    Skip stop
                  </button>
                </form>
              </div>
            </div>

            {nextStop ? (
              <div style={{ ...ui.card.base, marginTop: 18 }}>
                <p style={ui.page.eyebrow}>Next delivery preview</p>
                <h3 style={{ margin: "8px 0 0" }}>
                  #{nextStop.position} · Original stop {nextStop.original_position}
                </h3>
                <p style={mutedTextStyle}>{nextStop.address}</p>
              </div>
            ) : null}
          </>
        )}

        <div style={actionsStyle}>
          <Link
            href={`/app/routepro/routes/${route.id}/optimize`}
            style={routeProUi.secondaryButton}
          >
            Back to optimize
          </Link>

          <Link
            href={`/app/routepro/routes/${route.id}/summary`}
            style={routeProUi.secondaryButton}
          >
            Daily summary
          </Link>

          <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.secondaryButton}>
            Classic execution
          </Link>
        </div>
      </RouteProWorkflowShell>

      {showBottomBar ? (
        <div style={bottomBarStyle}>
          <div style={bottomBarInnerStyle}>
            <form action={completeRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button
                type="submit"
                style={{
                  ...routeProUi.primaryButton,
                  width: "100%",
                  padding: "18px",
                  fontSize: 17,
                  borderRadius: 14,
                }}
              >
                Complete
              </button>
            </form>

            <form action={skipRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button
                type="submit"
                style={{
                  ...routeProUi.secondaryButton,
                  width: "100%",
                  padding: "18px",
                  fontSize: 17,
                  borderRadius: 14,
                }}
              >
                Skip
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}