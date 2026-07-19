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
import { calculateRouteProMetrics } from "@/modules/routepro/server/routepro.metrics";

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
  fontSize: "clamp(24px, 3vw, 34px)",
lineHeight: 1.2,
fontWeight: 950,
  color: "#0f172a",
};

const cockpitHeroStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 18,
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
  padding: 16,
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
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const progressTrackStyle: React.CSSProperties = {
  marginTop: 20,
  height: 14,
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
  padding: 12,
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
  fontSize: 20,
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
  marginTop: 14,
  padding: "16px 18px",
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


const driverFocusGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const driverFocusCardStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
};

const driverFocusLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#475569",
};

const driverFocusValueStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "clamp(24px, 5vw, 34px)",
  lineHeight: 1,
  fontWeight: 950,
  color: "#0f172a",
};

const stickyDriverHeaderStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 40,
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 18,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
  backdropFilter: "blur(10px)",
};

const stickyDriverHeaderTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const stickyDriverHeaderNumberStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 950,
  color: "#ffffff",
  letterSpacing: "0.02em",
};

const stickyDriverHeaderAddressStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 14,
  lineHeight: 1.25,
  fontWeight: 800,
  color: "#cbd5e1",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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

const nextStopsCardStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 20,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,.06)",
};

const nextStopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const nextStopNumberStyle: React.CSSProperties = {
  fontWeight: 900,
  color: "#ff7a00",
  minWidth: 60,
};

const nextStopAddressStyle: React.CSSProperties = {
  flex: 1,
  marginLeft: 12,
  color: "#0f172a",
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
  if (minutes === null) return "-";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function getEstimatedRemainingMinutes(
  remainingStops: number,
  minutesPerStop: number | null,
): number | null {
  if (minutesPerStop === null) return null;
  return Math.round(remainingStops * minutesPerStop);
}

function getEstimatedEndTime(remainingMinutes: number | null): string {
  if (remainingMinutes === null) return "-";

  const end = new Date(Date.now() + remainingMinutes * 60 * 1000);

  return end.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
}

function getDuplicateStopsForAddress(
  stops: Array<{ address: string; original_position: number }>,
  address: string,
) {
  const normalizedAddress = normalizeAddress(address);

  return stops.filter(
    (stop) => normalizeAddress(stop.address) === normalizedAddress,
  );
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
  const metrics = calculateRouteProMetrics({
  status: route.status,
  started_at: route.started_at,
  completed_at: route.completed_at,
  last_activity_at: route.last_activity_at,
  shift_start_time: route.shift_start_time,
  shift_end_time: route.shift_end_time,
  stops: route.stops.map((stop) => ({
    id: stop.id,
    status: stop.status,
    completed_at: stop.completed_at,
    skipped_at: stop.skipped_at,
  })),
});
  const executableStops = route.stops.filter(
    (stop) => stop.status === "valid" && stop.lat !== null && stop.lng !== null,
  );

  const currentStop = executableStops[0];
  const nextStops = executableStops.slice(1, 4);
  const currentStopLat = currentStop?.lat ?? null;
  const currentStopLng = currentStop?.lng ?? null;
  const currentDuplicateStops = currentStop
  ? getDuplicateStopsForAddress(executableStops, currentStop.address)
  : [];

const currentDuplicateOriginalStops = currentDuplicateStops
  .map((stop) => `#${stop.original_position}`)
  .join(", ");

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
  const estimatedRemainingMinutes = getEstimatedRemainingMinutes(
  remainingCount,
  minutesPerStop,
);
const estimatedEndTime = getEstimatedEndTime(estimatedRemainingMinutes);

  const progressPercent =
    totalStops > 0 ? Math.round((doneCount / totalStops) * 100) : 0;
  const routeStartedAt = route.started_at
  ? new Date(route.started_at)
  : null;

const elapsedMinutes = metrics.operatingMinutes;

const realStopsPerHour = metrics.realStopsPerHour;

const realMinutesPerStop = metrics.averageMinutesPerStop;

const realEta = metrics.etaAt;

const paceStatus = metrics.paceLabel;

const paceDelta = metrics.deviationMinutes;

const completionRate =
  totalStops > 0
    ? Math.round((metrics.doneStops / totalStops) * 100)
    : 0;

const performanceScore = metrics.score ?? "-";

const performanceLabel =
  performanceScore === "A+"
    ? "Elite"
    : performanceScore === "A"
      ? "Ottimo"
      : performanceScore === "B"
        ? "Buono"
        : performanceScore === "C"
          ? "Da migliorare"
          : "In attesa dati";


  const isRouteCompleted = route.status === "completed";

  const showBottomBar =
    !isRouteCompleted &&
    currentStop &&
    currentStopLat !== null &&
    currentStopLng !== null;


  return (
    <section style={{ ...ui.page.section, paddingBottom: showBottomBar ? 112 : 0 }}>
      <RouteProHeader subtitle="Modalita driver" />

      {!isRouteCompleted && currentStop ? (
        <div style={stickyDriverHeaderStyle}>
          <div style={stickyDriverHeaderTopStyle}>
            <p style={stickyDriverHeaderNumberStyle}>
              Workflow #{currentStop.position}
            </p>

            <p style={stickyDriverHeaderNumberStyle}>
              Originale #{currentStop.original_position}
            </p>
          </div>

          <p style={stickyDriverHeaderAddressStyle}>{currentStop.address}</p>
        </div>
      ) : null}

      <div style={cockpitHeroStyle}>
        <p style={cockpitEyebrowStyle}>Driver Command Center</p>

        <h1 style={cockpitTitleStyle}>{route.name}</h1>

        <p style={cockpitSubtitleStyle}>
          Prepara, verifica, ottimizza e guida la tua rotta in un unico workflow.
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

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <p style={mutedTextStyle}>Stop corrente</p>
            <h3
              style={{
                margin: "4px 0 0",
                color: "#fff",
                fontSize: 30,
                fontWeight: 950,
              }}
            >
              {currentStop?.position ?? doneCount}/{totalStops}
            </h3>
          </div>

          <div>
            <p style={mutedTextStyle}>Rimanenti</p>
            <h3
              style={{
                margin: "4px 0 0",
                color: "#fff",
                fontSize: 30,
                fontWeight: 950,
              }}
            >
              {remainingCount}
            </h3>
          </div>

          <div>
            <p style={mutedTextStyle}>Completamento</p>
            <h3
              style={{
                margin: "4px 0 0",
                color: "#fff",
                fontSize: 30,
                fontWeight: 950,
              }}
            >
              {progressPercent}%
            </h3>
          </div>
        </div>

        <div style={intelligenceGridStyle}>
          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Tempo turno</p>
            <h3 style={intelligenceValueStyle}>{formatMinutes(shiftMinutes)}</h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Ritmo richiesto</p>
            <h3 style={intelligenceValueStyle}>
              {requiredStopsPerHour !== null ? `${requiredStopsPerHour}/h` : "-"}
            </h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Media stop</p>
            <h3 style={intelligenceValueStyle}>
              {minutesPerStop !== null ? `${minutesPerStop} min` : "-"}
            </h3>
          </article>

          <article style={intelligenceCardStyle}>
            <p style={intelligenceLabelStyle}>Stato operativo</p>
            <span style={intelligenceBadgeStyle}>{operationalStatus}</span>
          </article>

          <article style={intelligenceCardStyle}>
  <p style={intelligenceLabelStyle}>Tempo residuo stimato</p>
  <h3 style={intelligenceValueStyle}>
    {formatMinutes(estimatedRemainingMinutes)}
  </h3>
</article>

<article style={intelligenceCardStyle}>
  <p style={intelligenceLabelStyle}>ETA fine rotta</p>
  <h3 style={intelligenceValueStyle}>{estimatedEndTime}</h3>
</article>

<article style={intelligenceCardStyle}>
  <p style={intelligenceLabelStyle}>Ritmo reale</p>

  <h3 style={intelligenceValueStyle}>
    {realStopsPerHour !== null
      ? `${realStopsPerHour}/h`
      : "-"}
  </h3>
</article>

<article style={intelligenceCardStyle}>
  <p style={intelligenceLabelStyle}>ETA reale</p>

  <h3 style={intelligenceValueStyle}>
    {realEta
      ? realEta.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-"}
  </h3>
</article>

<article style={intelligenceCardStyle}>
  <p style={intelligenceLabelStyle}>Pace Status</p>

  <span
    style={{
      ...intelligenceBadgeStyle,
      background:
        paceStatus === "In anticipo"
          ? "rgba(34,197,94,0.16)"
          : paceStatus === "In ritardo"
            ? "rgba(239,68,68,0.16)"
            : "rgba(255,122,0,0.16)",
      color:
        paceStatus === "In anticipo"
          ? "#bbf7d0"
          : paceStatus === "In ritardo"
            ? "#fecaca"
            : "#fed7aa",
    }}
  >
    {paceStatus}
  </span>

  <p
    style={{
      margin: "8px 0 0",
      fontSize: 12,
      fontWeight: 700,
      color: "rgba(255,255,255,0.72)",
    }}
  >
    {paceDelta !== null
  ? `${paceDelta >= 0 ? "+" : ""}${paceDelta} min`
  : "Completa almeno 3 stop"}
  </p>
</article>
        </div>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {completed === "1" ? <div style={successStyle}>Stop completato. Passa al prossimo.</div> : null}
      {skipped === "1" ? <div style={successStyle}>Stop saltato. Passa al prossimo.</div> : null}
      {routeCompleted === "1" ? <div style={successStyle}>Rotta terminata correttamente.</div> : null}

      {isRouteCompleted ? (
        <div style={cockpitHeroStyle}>
          <p style={cockpitEyebrowStyle}>Riepilogo rotta</p>

          <h2 style={cockpitTitleStyle}>Rotta completata</h2>

          <p style={cockpitSubtitleStyle}>
            Giornata chiusa. Qui trovi i numeri principali della rotta e una lettura rapida della performance.
          </p>

          <div style={intelligenceGridStyle}>
            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Stop totali</p>
              <h3 style={intelligenceValueStyle}>{totalStops}</h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Completati</p>
              <h3 style={intelligenceValueStyle}>{completedStops.length}</h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Saltati</p>
              <h3 style={intelligenceValueStyle}>{skippedStops.length}</h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Completamento</p>
              <h3 style={intelligenceValueStyle}>{completionRate}%</h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Tempo operativo</p>
              <h3 style={intelligenceValueStyle}>{formatMinutes(elapsedMinutes)}</h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Ritmo reale</p>
              <h3 style={intelligenceValueStyle}>
                {realStopsPerHour !== null ? `${realStopsPerHour}/h` : "-"}
              </h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Tempo medio stop</p>
              <h3 style={intelligenceValueStyle}>
                {realMinutesPerStop !== null ? `${realMinutesPerStop} min` : "-"}
              </h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Obiettivo ritmo</p>
              <h3 style={intelligenceValueStyle}>
                {requiredStopsPerHour !== null ? `${requiredStopsPerHour}/h` : "-"}
              </h3>
            </article>

            <article style={intelligenceCardStyle}>
              <p style={intelligenceLabelStyle}>Score RoutePro</p>
              <h3
                style={{
                  ...intelligenceValueStyle,
                  color: "#ff7a00",
                }}
              >
                {performanceScore}
              </h3>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {performanceLabel}
              </p>
            </article>
          </div>

          <div style={progressTrackStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: "100%",
              }}
            />
          </div>

          <p style={mutedTextStyle}>
            Riepilogo pronto per valutare velocita, continuita e qualita della rotta.
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

          <div
  style={{
    ...bigStopNumberStyle,
    fontSize: "clamp(38px, 6vw, 58px)",
  }}
>
  #{currentStop.position}
</div>

          <div style={driverFocusGridStyle}>
            <article style={driverFocusCardStyle}>
              <p style={driverFocusLabelStyle}>Posizione RoutePro</p>
              <h3 style={driverFocusValueStyle}>#{currentStop.position}</h3>
            </article>

            <article style={driverFocusCardStyle}>
              <p style={driverFocusLabelStyle}>Numero originale app</p>
              <h3 style={driverFocusValueStyle}>#{currentStop.original_position}</h3>
            </article>
          </div>

          {currentDuplicateStops.length > 1 ? (
  <div style={stopBadgeRowStyle}>
    <span style={originalStopBadgeStyle}>
      {currentDuplicateStops.length} STOPS
    </span>

    <span style={optimizedStopBadgeStyle}>
      Originali: {currentDuplicateOriginalStops}
    </span>
  </div>
) : null}

          <div
  style={{
    ...addressStyle,
    marginTop: 24,
  }}
>
  {currentStop.address}
</div>

          <div style={{ marginTop: 16 }}>
            <a
              href={getGoogleMapsUrl(currentStopLat, currentStopLng)}
              target="_blank"
              rel="noreferrer"
              style={primaryNavigateStyle}
            >
              NAVIGA ORA
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
              Google Maps
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
              Waze
            </a>
          </div>
        </div>
      )}

      {nextStops.length > 0 ? (
  <details style={nextStopsCardStyle}>
    <summary
      style={{
        cursor: "pointer",
        fontWeight: 950,
        color: "#0f172a",
      }}
    >
      Prossimi stop ({nextStops.length})
    </summary>

    <div style={{ marginTop: 10 }}>
      {nextStops.map((stop) => {
        const duplicateStops = getDuplicateStopsForAddress(
          executableStops,
          stop.address,
        );

        return (
          <div key={stop.id} style={nextStopRowStyle}>
            <span style={nextStopNumberStyle}>#{stop.position}</span>

            <span style={nextStopAddressStyle}>
              {stop.address}
              {duplicateStops.length > 1 ? ` (${duplicateStops.length}x)` : ""}
            </span>
          </div>
        );
      })}
    </div>
  </details>
) : null}

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
                COMPLETA
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
                SALTA
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
