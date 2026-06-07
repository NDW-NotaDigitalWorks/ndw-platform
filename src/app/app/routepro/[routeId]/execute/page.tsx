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
  color: "#cbd5e1",
  fontWeight: 700,
};

const lightMutedTextStyle: React.CSSProperties = {
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
  marginTop: 16,
};

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  marginTop: 20,
};

const bigStopNumberStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: "clamp(38px, 5vw, 62px)",
  lineHeight: 0.92,
  fontWeight: 950,
  letterSpacing: "-0.08em",
  color: "#0f172a",
};

const addressStyle: React.CSSProperties = {
  margin: "20px 0 0",
  fontSize: "clamp(18px, 2.2vw, 26px)",
  lineHeight: 1.18,
  fontWeight: 950,
  color: "#0f172a",
};

const cockpitHeroStyle: React.CSSProperties = {
  marginTop: 20,
  padding: 26,
  borderRadius: 28,
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.92) 100%)",
  border: "1px solid rgba(96,165,250,0.30)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.22)",
};

const cockpitEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#ff7a00",
};

const cockpitTitleStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: "clamp(34px, 5vw, 58px)",
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.05em",
  color: "#ffffff",
};

const cockpitSubtitleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 16,
  lineHeight: 1.6,
  fontWeight: 700,
  color: "#cbd5e1",
};

const statCardStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 24,
  background: "linear-gradient(180deg,#16255f 0%,#203b9b 100%)",
  border: "1px solid rgba(96,165,250,.25)",
  boxShadow: "0 18px 42px rgba(15,23,42,.15)",
};

const statLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#93c5fd",
};

const statValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const progressTrackStyle: React.CSSProperties = {
  marginTop: 20,
  height: 12,
  borderRadius: 999,
  background: "rgba(255,255,255,.10)",
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg,#ff7a00,#ffb347)",
};

const intelligenceGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const intelligenceCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.16)",
};

const intelligenceLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#93c5fd",
};

const intelligenceValueStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const intelligenceBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: 8,
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(255,122,0,0.16)",
  color: "#fed7aa",
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const currentStopCardStyle: React.CSSProperties = {
  marginTop: 18,
  padding: "20px 24px",
  borderRadius: 28,
  background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
  border: "1px solid #cbd5e1",
  boxShadow: "0 24px 60px rgba(15,23,42,.12)",
};

const stopBadgeRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const originalStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 15px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 950,
  fontSize: 14,
};

const optimizedStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 15px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 14,
};

const primaryNavigateStyle: React.CSSProperties = {
  ...routeProUi.primaryButton,
  width: "100%",
  minHeight: 52,
  padding: "14px",
  fontSize: 20,
  borderRadius: 18,
  background: "#ff7a00",
  borderColor: "#ff7a00",
  color: "#ffffff",
  boxShadow: "0 16px 36px rgba(255,122,0,0.30)",
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

const bottomBarStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
  padding: "12px 16px",
  background: "rgba(15,23,42,0.96)",
  borderTop: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 -10px 30px rgba(15, 23, 42, 0.30)",
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

function getTimeMinutes(value?: string | null): number | null {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getShiftMinutes(
  shiftStartTime?: string | null,
  shiftEndTime?: string | null,
  breakMinutes?: number | null,
): number | null {
  const start = getTimeMinutes(shiftStartTime);
  const end = getTimeMinutes(shiftEndTime);

  if (start === null || end === null) return null;

  const rawMinutes = end > start ? end - start : end + 1440 - start;
  return Math.max(rawMinutes - (breakMinutes ?? 0), 0);
}

function getRequiredStopsPerHour(
  stops: number,
  availableMinutes: number | null,
): number | null {
  if (availableMinutes === null || availableMinutes <= 0) return null;

  return Math.round((stops / (availableMinutes / 60)) * 10) / 10;
}

function getMinutesPerStop(requiredStopsPerHour: number | null): number | null {
  if (requiredStopsPerHour === null || requiredStopsPerHour <= 0) return null;

  return Math.round((60 / requiredStopsPerHour) * 10) / 10;
}

function getOperationalStatus(requiredStopsPerHour: number | null): string {
  if (requiredStopsPerHour === null) return "Profilo incompleto";
  if (requiredStopsPerHour <= 18) return "Nei tempi";
  if (requiredStopsPerHour <= 24) return "Ritmo alto";
  return "Critico";
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
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
  const shiftMinutes = getShiftMinutes(
    route.shift_start_time,
    route.shift_end_time,
    route.break_minutes,
  );
  const requiredStopsPerHour = getRequiredStopsPerHour(
    remainingCount,
    shiftMinutes,
  );
  const minutesPerStop = getMinutesPerStop(requiredStopsPerHour);
  const operationalStatus = getOperationalStatus(requiredStopsPerHour);
  const progressPercent =
    totalStops > 0 ? Math.round((doneCount / totalStops) * 100) : 0;
  const isRouteCompleted = route.status === "completed";

  const showBottomBar =
    !isRouteCompleted &&
    currentStop &&
    currentStopLat !== null &&
    currentStopLng !== null;

  return (
    <section style={{ ...ui.page.section, paddingBottom: showBottomBar ? 112 : 0 }}>
      <RouteProHeader subtitle="Driver execution mode" />

      <div style={cockpitHeroStyle}>
        <p style={cockpitEyebrowStyle}>Driver Cockpit</p>

        <h1 style={cockpitTitleStyle}>{route.name}</h1>

        <p style={cockpitSubtitleStyle}>
          Follow the route stop by stop. Navigate, complete, skip and keep your day under control.
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

        <div style={progressTrackStyle}>
          <div style={{ ...progressFillStyle, width: `${progressPercent}%` }} />
        </div>

        <p style={mutedTextStyle}>
          Progress: <strong>{progressPercent}%</strong> · Stop {currentStop?.position ?? doneCount} / {totalStops}
        </p>

        <div style={intelligenceGridStyle}>
          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Tempo turno</p>
            <h3 style={intelligenceValueStyle}>{formatMinutes(shiftMinutes)}</h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Ritmo richiesto</p>
            <h3 style={intelligenceValueStyle}>
              {requiredStopsPerHour !== null ? `${requiredStopsPerHour}/h` : "—"}
            </h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Media stop</p>
            <h3 style={intelligenceValueStyle}>
              {minutesPerStop !== null ? `${minutesPerStop} min` : "—"}
            </h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Stato operativo</p>
            <span style={intelligenceBadgeStyle}>{operationalStatus}</span>
          </article>
        </div>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {completed === "1" ? <div style={successStyle}>Stop completato. Passa al prossimo.</div> : null}
      {skipped === "1" ? <div style={successStyle}>Stop saltato. Passa al prossimo.</div> : null}
      {routeCompleted === "1" ? <div style={successStyle}>Rotta terminata correttamente.</div> : null}

      {isRouteCompleted ? (
        <div style={currentStopCardStyle}>
          <h2 style={ui.page.sectionTitle}>Rotta completata</h2>
          <p style={lightMutedTextStyle}>
            Hai gestito {doneCount} stop su {totalStops}.
          </p>
        </div>
      ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
        <div style={currentStopCardStyle}>
          <h2 style={ui.page.sectionTitle}>Fine rotta</h2>
          <p style={lightMutedTextStyle}>
            Non ci sono altri stop validi da eseguire. Puoi terminare la rotta.
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

          <div style={addressStyle}>📍 {currentStop.address}</div>

          <div style={{ marginTop: 16 }}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={primaryNavigateStyle}
            >
              🧭 NAVIGA ORA
            </a>
          </div>

                    <div style={mobileActionsStyle}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={{
                ...routeProUi.secondaryButton,
                minHeight: 46,
                padding: "12px 14px",
                fontSize: 14,
                borderRadius: 14,
                background: "#0f2345",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
              }}
            >
              🗺 Google Maps
            </a>

            <a
              href={getWazeUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={{
                ...routeProUi.secondaryButton,
                minHeight: 46,
                padding: "12px 14px",
                fontSize: 14,
                borderRadius: 14,
                background: "#0f2345",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
              }}
            >
              🚘 Waze
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
                  background: "#ff7a00",
                  borderColor: "#ff7a00",
                  color: "#ffffff",
                }}
              >
                ✓ COMPLETE STOP
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
                  background: "#ffffff",
                  color: "#0f172a",
                }}
              >
                ↷ SKIP STOP
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
