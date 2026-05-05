import Link from "next/link";
import { notFound } from "next/navigation";
import {
  completeRouteProRoute,
  completeRouteProStop,
  skipRouteProStop,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
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
  fontSize: 14,
  lineHeight: 1.6,
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

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 12,
  marginTop: 20,
};

const bigStopNumberStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 56,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-2px",
};

const addressStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: 24,
  lineHeight: 1.3,
  fontWeight: 800,
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

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>RoutePro Execution</p>
      <h1 style={ui.page.title}>{route.name}</h1>
      <p style={ui.page.subtitle}>
        Modalità lavoro mobile-first per seguire la rotta stop dopo stop.
      </p>

      <div style={actionsStyle}>
        <Link href={`/app/routepro/${route.id}`} style={ui.button.secondary}>
          Torna alla rotta
        </Link>

        <Link href="/app/routepro" style={ui.button.secondary}>
          Storico rotte
        </Link>
      </div>

      <div style={statGridStyle}>
        <article style={{ ...ui.card.base, padding: 16 }}>
          <p style={ui.page.eyebrow}>Gestiti</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>
            {doneCount}/{totalStops}
          </h2>
        </article>

        <article style={{ ...ui.card.base, padding: 16 }}>
          <p style={ui.page.eyebrow}>Rimanenti</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>
            {remainingCount}
          </h2>
        </article>

        <article style={{ ...ui.card.base, padding: 16 }}>
          <p style={ui.page.eyebrow}>Saltati</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>
            {skippedStops.length}
          </h2>
        </article>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {completed === "1" && <div style={successStyle}>Stop completato. Passa al prossimo.</div>}
      {skipped === "1" && <div style={successStyle}>Stop saltato. Passa al prossimo.</div>}
      {routeCompleted === "1" && <div style={successStyle}>Rotta terminata correttamente.</div>}

      {isRouteCompleted ? (
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <h2 style={ui.page.sectionTitle}>Rotta completata</h2>
          <p style={mutedTextStyle}>
            Hai gestito {doneCount} stop su {totalStops}.
          </p>
        </div>
      ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <h2 style={ui.page.sectionTitle}>Fine rotta</h2>

          <form action={completeRouteProRoute}>
            <input type="hidden" name="route_id" value={route.id} />

            <button
              type="submit"
              style={{
                ...ui.button.primary,
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
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <p style={ui.page.eyebrow}>Stop corrente</p>

          <div style={bigStopNumberStyle}>
            #{currentStop.position}
          </div>

          <p style={mutedTextStyle}>
            Stop originale: <strong>{currentStop.original_position}</strong>
          </p>

          <div style={addressStyle}>{currentStop.address}</div>

          <div style={mobileActionsStyle}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={{
                ...ui.button.primary,
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
                ...ui.button.secondary,
                padding: "16px 18px",
                fontSize: 16,
                borderRadius: 14,
              }}
            >
              Waze
            </a>
          </div>

          <div style={mobileActionsStyle}>
            <form action={completeRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button
                type="submit"
                style={{
                  ...ui.button.primary,
                  width: "100%",
                  padding: "18px",
                  fontSize: 18,
                  borderRadius: 14,
                }}
              >
                Completa stop
              </button>
            </form>

            <form action={skipRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button
                type="submit"
                style={{
                  ...ui.button.secondary,
                  width: "100%",
                  padding: "18px",
                  fontSize: 18,
                  borderRadius: 14,
                }}
              >
                Salta stop
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}