import Link from "next/link";
import { notFound } from "next/navigation";
import {
  completeRouteProRoute,
  completeRouteProStop,
  skipRouteProStop,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
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

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 15,
  lineHeight: 1.6,
  color: "#334155",
  fontWeight: 700,
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
  marginTop: 22,
};

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  marginTop: 20,
};

const bigStopNumberStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: "clamp(56px, 9vw, 96px)",
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.06em",
  color: "#0f172a",
};

const addressStyle: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: "clamp(24px, 4vw, 38px)",
  lineHeight: 1.22,
  fontWeight: 950,
  color: "#0f172a",
};

const statCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 20,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
};

const statLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#2563eb",
};

const statValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 950,
  color: "#0f172a",
};

const currentStopCardStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 24,
  padding: 28,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.1)",
};

const stopBadgeRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 16,
};

const originalStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: 14,
};

const optimizedStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 900,
  fontSize: 14,
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf5",
  color: "#047857",
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 600,
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

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

function getErrorMessage(error?: string): string | null {
  if (error === "complete-failed") {
    return "Non siamo riusciti a completare lo stop. Riprova.";
  }

  if (error === "skip-failed") {
    return "Non siamo riusciti a saltare lo stop. Riprova.";
  }

  if (error === "route-complete-failed") {
    return "Non siamo riusciti a terminare la rotta. Riprova.";
  }

  return null;
}

export default async function RouteProExecutePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;

  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const completed = resolvedSearchParams?.completed;
  const skipped = resolvedSearchParams?.skipped;
  const routeCompleted = resolvedSearchParams?.routeCompleted;

  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const completedStops = route.stops.filter(
    (stop) => stop.status === "completed",
  );
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped");
  const executableStops = route.stops.filter(
    (stop) => stop.status === "valid" && stop.lat !== null && stop.lng !== null,
  );

  const currentStop = executableStops[0];
  const currentStopLat = currentStop?.lat ?? null;
  const currentStopLng = currentStop?.lng ?? null;

  const totalStops = route.stops.length;
  const doneCount = completedStops.length + skippedStops.length;
  const remainingCount = executableStops.length;
  const isRouteCompleted = route.status === "completed";

  const showBottomBar =
    !isRouteCompleted &&
    currentStop &&
    currentStopLat !== null &&
    currentStopLng !== null;

  return (
    <section style={{ ...ui.page.section, paddingBottom: showBottomBar ? 110 : 0 }}>
      <RouteProHeader subtitle="Driver execution mode" />

      <p style={statLabelStyle}>Percorso attivo</p>
      <h1 style={{ ...ui.page.title, color: "#ffffff" }}>{route.name}</h1>
      <p style={{ ...ui.page.subtitle, color: "#94a3b8" }}>
        Segui la rotta stop dopo stop con Maps, Waze, complete e skip.
      </p>

      <div style={actionsStyle}>
        <Link href={`/app/routepro/${route.id}`} style={routeProUi.secondaryButton}>
          Torna alla rotta
        </Link>

        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Storico rotte
        </Link>
      </div>

      <div style={statGridStyle}>
        <article style={statCardStyle}>
          <p style={statLabelStyle}>Gestiti</p>
          <h2 style={statValueStyle}>
            {doneCount}/{totalStops}
          </h2>
        </article>

        <article style={statCardStyle}>
          <p style={statLabelStyle}>Rimanenti</p>
          <h2 style={statValueStyle}>
            {remainingCount}
          </h2>
        </article>

        <article style={statCardStyle}>
          <p style={statLabelStyle}>Saltati</p>
          <h2 style={statValueStyle}>
            {skippedStops.length}
          </h2>
        </article>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {completed === "1" ? <div style={successStyle}>Stop completato. Passa al prossimo.</div> : null}
      {skipped === "1" ? <div style={successStyle}>Stop saltato. Passa al prossimo.</div> : null}
      {routeCompleted === "1" ? <div style={successStyle}>Rotta terminata correttamente.</div> : null}

      {isRouteCompleted ? (
        <div style={currentStopCardStyle}>
          <h2 style={ui.page.sectionTitle}>Rotta completata</h2>
          <p style={mutedTextStyle}>
            Hai gestito {doneCount} stop su {totalStops}.
          </p>
        </div>
      ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
        <div style={currentStopCardStyle}>
          <h2 style={ui.page.sectionTitle}>Fine rotta</h2>

          <form action={completeRouteProRoute}>
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
              Termina rotta
            </button>
          </form>
        </div>
      ) : (
        <div style={currentStopCardStyle}>
          <p style={statLabelStyle}>Stop corrente</p>

          <div style={bigStopNumberStyle}>
            #{currentStop.position}
          </div>

          <div style={stopBadgeRowStyle}>
            <span style={optimizedStopBadgeStyle}>
              OPT #{currentStop.position}
            </span>

            <span style={originalStopBadgeStyle}>
              STOP #{currentStop.original_position}
            </span>
          </div>

          <div style={addressStyle}>{currentStop.address}</div>

          <div style={mobileActionsStyle}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={{
                ...routeProUi.primaryButton,
                padding: "16px 18px",
                fontSize: 16,
                borderRadius: 14,
              }}
            >
              Google Maps
            </a>

            <a
              href={getWazeUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={{
                ...routeProUi.secondaryButton,
                padding: "16px 18px",
                fontSize: 16,
                borderRadius: 14,
              }}
            >
              Waze
            </a>
          </div>
        </div>
      )}

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
                Completa
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
                Salta
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
