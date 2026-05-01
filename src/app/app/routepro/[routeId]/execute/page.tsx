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
        Progresso: {doneCount} / {totalStops} stop gestiti · {remainingCount} rimanenti
      </p>

      <div style={actionsStyle}>
        <Link href={`/app/routepro/${route.id}`} style={ui.button.secondary}>
          Torna alla rotta
        </Link>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {completed === "1" ? (
        <div style={successStyle}>Stop completato. Passa al prossimo.</div>
      ) : null}

      {skipped === "1" ? (
        <div style={successStyle}>Stop saltato. Passa al prossimo.</div>
      ) : null}

      {routeCompleted === "1" ? (
        <div style={successStyle}>Rotta terminata correttamente.</div>
      ) : null}

      {isRouteCompleted ? (
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <h2 style={ui.page.sectionTitle}>Rotta completata</h2>
          <p style={mutedTextStyle}>
            Hai gestito {doneCount} stop su {totalStops}. Stop completati:{" "}
            {completedStops.length}. Stop saltati: {skippedStops.length}.
          </p>

          <div style={actionsStyle}>
            <Link href="/app/routepro" style={ui.button.primary}>
              Torna allo storico rotte
            </Link>

            <Link href={`/app/routepro/${route.id}`} style={ui.button.secondary}>
              Dettaglio rotta
            </Link>
          </div>
        </div>
      ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <h2 style={ui.page.sectionTitle}>Rotta quasi completata</h2>
          <p style={mutedTextStyle}>
            Non ci sono altri stop validi con coordinate da eseguire. Puoi
            terminare la rotta oppure tornare al dettaglio per controllare stop
            saltati o da rivedere.
          </p>

          <div style={actionsStyle}>
            <form action={completeRouteProRoute}>
              <input type="hidden" name="route_id" value={route.id} />

              <button type="submit" style={ui.button.primary}>
                Termina rotta
              </button>
            </form>

            <Link href={`/app/routepro/${route.id}`} style={ui.button.secondary}>
              Torna alla rotta
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ ...ui.card.base, marginTop: 24 }}>
          <p style={ui.page.eyebrow}>Stop corrente</p>
          <h2 style={{ ...ui.page.title, fontSize: 28 }}>
            #{currentStop.position} (orig: {currentStop.original_position})
          </h2>
          <p style={{ ...ui.page.subtitle, fontSize: 18 }}>
            {currentStop.address}
          </p>

          <p style={mutedTextStyle}>
            Coordinate: {currentStopLat}, {currentStopLng}
          </p>

          <div style={actionsStyle}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={ui.button.primary}
            >
              Apri Google Maps
            </a>

            <a
              href={getWazeUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={ui.button.secondary}
            >
              Apri Waze
            </a>
          </div>

          <div style={actionsStyle}>
            <form action={completeRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button type="submit" style={ui.button.primary}>
                Completa stop
              </button>
            </form>

            <form action={skipRouteProStop}>
              <input type="hidden" name="route_id" value={route.id} />
              <input type="hidden" name="stop_id" value={currentStop.id} />

              <button type="submit" style={ui.button.secondary}>
                Salta stop
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}