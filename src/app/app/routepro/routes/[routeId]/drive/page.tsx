import Link from "next/link";
import { notFound } from "next/navigation";
import {
  completeRouteProRoute,
  completeRouteProStop,
  skipRouteProStop,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { getClusterStopsForCurrentStop } from "@/modules/routepro/v2/domain/routepro.clusters";
import { RouteProCompleteSlider } from "@/modules/routepro/ui/RouteProCompleteSlider";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    completed?: string;
    skipped?: string;
    routeCompleted?: string;
  }>;
};

const commandCardStyle: React.CSSProperties = {
  marginTop: 18,
  overflow: "hidden",
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.09)",
  background:
    "radial-gradient(circle at 88% 0%,rgba(249,115,22,0.16) 0%,transparent 30%), linear-gradient(160deg,#172033 0%,#0f172a 68%,#020617 100%)",
  boxShadow: "0 28px 70px rgba(0,0,0,0.34)",
};

const commandHeaderStyle: React.CSSProperties = {
  padding: "18px clamp(18px,4vw,30px)",
  borderBottom: "1px solid rgba(148,163,184,0.14)",
};

const stopGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 10,
  marginTop: 16,
};

const numberCardStyle: React.CSSProperties = {
  minWidth: 0,
  padding: "16px 14px",
  borderRadius: 20,
  border: "1px solid rgba(148,163,184,0.15)",
  background: "rgba(15,23,42,0.72)",
  textAlign: "center",
};

const numberStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#ffffff",
  fontSize: "clamp(42px,12vw,72px)",
  lineHeight: 0.9,
  fontWeight: 950,
  letterSpacing: "-0.07em",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 950,
  letterSpacing: "0.11em",
  textTransform: "uppercase",
};

const addressPanelStyle: React.CSSProperties = {
  padding: "clamp(22px,5vw,38px) clamp(18px,4vw,30px)",
  borderBottom: "1px solid rgba(148,163,184,0.14)",
};

const addressStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: "#ffffff",
  fontSize: "clamp(27px,7vw,48px)",
  lineHeight: 1.04,
  fontWeight: 950,
  letterSpacing: "-0.045em",
  overflowWrap: "anywhere",
};

const progressSectionStyle: React.CSSProperties = {
  padding: "18px clamp(18px,4vw,30px)",
  borderBottom: "1px solid rgba(148,163,184,0.14)",
};

const progressTrackStyle: React.CSSProperties = {
  height: 11,
  marginTop: 12,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(71,85,105,0.48)",
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: 10,
  marginTop: 14,
};

const metricStyle: React.CSSProperties = {
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.14)",
  background: "rgba(15,23,42,0.58)",
};

const navigationGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: 12,
  padding: "18px clamp(18px,4vw,30px) 24px",
};

const navButtonStyle: React.CSSProperties = {
  minHeight: 62,
  borderRadius: 18,
  fontSize: 16,
  fontWeight: 950,
  textAlign: "center",
};

const clusterStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 17,
  borderRadius: 19,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(30,64,175,0.14)",
};

const chipRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const chipStyle: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 950,
};

const nextCardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "18px clamp(18px,4vw,24px)",
  borderRadius: 22,
  border: "1px solid rgba(148,163,184,0.14)",
  background:
    "linear-gradient(180deg,rgba(30,41,59,0.88) 0%,rgba(15,23,42,0.94) 100%)",
};

const noticeStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 14,
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 850,
};

const actionDockStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 60,
  padding: "12px 14px max(12px,env(safe-area-inset-bottom))",
  borderTop: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(2,6,23,0.94)",
  boxShadow: "0 -18px 50px rgba(0,0,0,0.38)",
  backdropFilter: "blur(18px)",
};

const actionDockInnerStyle: React.CSSProperties = {
  width: "min(760px,100%)",
  margin: "0 auto",
};

const secondaryActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 9,
  marginTop: 18,
};

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

function getProgressPercent(doneCount: number, totalStops: number): number {
  if (totalStops === 0) return 0;
  return Math.round((doneCount / totalStops) * 100);
}

function getErrorMessage(error?: string): string | null {
  if (error === "complete-failed") return "Non è stato possibile completare lo stop.";
  if (error === "skip-failed") return "Non è stato possibile saltare lo stop.";
  if (error === "route-complete-failed") return "Non è stato possibile completare la rotta.";
  return null;
}

export default async function RouteProDrivePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) notFound();

  const completedStops = route.stops.filter((stop) => stop.status === "completed");
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped");
  const executableStops = route.stops.filter(
    (stop) => stop.status === "valid" && stop.lat !== null && stop.lng !== null,
  );

  const currentStop = executableStops[0];
  const nextStop = executableStops[1];
  const currentStopLat = currentStop?.lat ?? null;
  const currentStopLng = currentStop?.lng ?? null;
  const currentClusterStops = getClusterStopsForCurrentStop(currentStop, route.stops);
  const isClusteredDelivery = currentClusterStops.length > 1;
  const totalStops = route.stops.length;
  const doneCount = completedStops.length + skippedStops.length;
  const remainingCount = executableStops.length;
  const progressPercent = getProgressPercent(doneCount, totalStops);
  const isRouteCompleted = route.status === "completed";
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const showActionDock =
    !isRouteCompleted && currentStop !== undefined && currentStopLat !== null && currentStopLng !== null;

  return (
    <div style={{ paddingBottom: showActionDock ? 150 : 0 }}>
      <RouteProWorkflowShell
        routeId={routeId}
        currentStep="Drive"
        title="Driver Command Center"
        subtitle="Tutto ciò che serve durante la consegna, senza distrazioni."
      >
        {resolvedSearchParams?.completed === "1" ? (
          <div style={{ ...noticeStyle, background: "rgba(34,197,94,0.14)", border: "1px solid rgba(74,222,128,0.26)", color: "#bbf7d0" }}>
            Stop completato. Il prossimo indirizzo è già pronto.
          </div>
        ) : null}

        {resolvedSearchParams?.skipped === "1" ? (
          <div style={{ ...noticeStyle, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(251,191,36,0.24)", color: "#fde68a" }}>
            Stop saltato. Puoi continuare la rotta.
          </div>
        ) : null}

        {errorMessage ? (
          <div style={{ ...noticeStyle, background: "rgba(244,63,94,0.12)", border: "1px solid rgba(251,113,133,0.24)", color: "#fecdd3" }}>
            {errorMessage}
          </div>
        ) : null}

        {isRouteCompleted ? (
          <section style={commandCardStyle}>
            <div style={{ padding: "clamp(28px,7vw,54px)", textAlign: "center" }}>
              <p style={{ ...eyebrowStyle, color: "#86efac" }}>Rotta conclusa</p>
              <div style={{ marginTop: 14, color: "#4ade80", fontSize: 64, lineHeight: 1, fontWeight: 950 }}>✓</div>
              <h2 style={{ margin: "14px 0 0", color: "#ffffff", fontSize: "clamp(30px,8vw,52px)", lineHeight: 1, fontWeight: 950, letterSpacing: "-0.05em" }}>
                Ottimo lavoro
              </h2>
              <p style={{ margin: "12px auto 0", maxWidth: 560, color: "#94a3b8", fontSize: 15, lineHeight: 1.55, fontWeight: 700 }}>
                Hai gestito {doneCount} stop su {totalStops}.
              </p>
              <Link href={`/app/routepro/routes/${route.id}/summary`} style={{ ...routeProUi.primaryButton, marginTop: 24, minHeight: 56, padding: "0 24px", borderRadius: 17 }}>
                Apri il riepilogo
              </Link>
            </div>
          </section>
        ) : !currentStop || currentStopLat === null || currentStopLng === null ? (
          <section style={commandCardStyle}>
            <div style={{ padding: "clamp(24px,6vw,42px)" }}>
              <p style={eyebrowStyle}>Fine degli stop verificati</p>
              <h2 style={{ margin: "9px 0 0", color: "#ffffff", fontSize: "clamp(28px,7vw,44px)", lineHeight: 1.05, fontWeight: 950, letterSpacing: "-0.045em" }}>
                La rotta è pronta per essere chiusa
              </h2>
              <form action={completeRouteProRoute} style={{ marginTop: 24 }}>
                <input type="hidden" name="route_id" value={route.id} />
                <button type="submit" style={{ ...routeProUi.primaryButton, width: "100%", minHeight: 62, borderRadius: 18, fontSize: 17 }}>
                  Completa la rotta
                </button>
              </form>
            </div>
          </section>
        ) : (
          <>
            <section style={commandCardStyle}>
              <div style={commandHeaderStyle}>
                <p style={eyebrowStyle}>Stop corrente</p>
                <div style={stopGridStyle}>
                  <div style={numberCardStyle}>
                    <p style={{ ...eyebrowStyle, color: "#fb923c" }}>Ordine RoutePro</p>
                    <div style={numberStyle}>{currentStop.position}</div>
                  </div>
                  <div style={numberCardStyle}>
                    <p style={eyebrowStyle}>Numero originale</p>
                    <div style={numberStyle}>{currentStop.original_position}</div>
                  </div>
                </div>
              </div>

              <div style={addressPanelStyle}>
                <p style={eyebrowStyle}>Destinazione</p>
                <div style={addressStyle}>{currentStop.address}</div>

                {isClusteredDelivery ? (
                  <div style={clusterStyle}>
                    <p style={{ ...eyebrowStyle, color: "#93c5fd" }}>Consegna multipla</p>
                    <p style={{ margin: "7px 0 0", color: "#ffffff", fontSize: 20, lineHeight: 1.25, fontWeight: 950 }}>
                      {currentClusterStops.length} consegne allo stesso indirizzo
                    </p>
                    <div style={chipRowStyle}>
                      {currentClusterStops.map((stop) => (
                        <span key={stop.id} style={chipStyle}>Stop {stop.original_position}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div style={progressSectionStyle}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
                  <div>
                    <p style={eyebrowStyle}>Avanzamento rotta</p>
                    <div style={{ marginTop: 5, color: "#ffffff", fontSize: 27, lineHeight: 1, fontWeight: 950 }}>{progressPercent}%</div>
                  </div>
                  <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.35, fontWeight: 850, textAlign: "right" }}>
                    {doneCount} gestiti<br />{totalStops} totali
                  </div>
                </div>

                <div role="progressbar" aria-label="Avanzamento della rotta" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent} style={progressTrackStyle}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#f97316 0%,#22c55e 100%)" }} />
                </div>

                <div style={metricsGridStyle}>
                  <div style={metricStyle}><p style={eyebrowStyle}>Rimanenti</p><div style={{ marginTop: 5, color: "#ffffff", fontSize: 25, fontWeight: 950 }}>{remainingCount}</div></div>
                  <div style={metricStyle}><p style={eyebrowStyle}>Completati</p><div style={{ marginTop: 5, color: "#ffffff", fontSize: 25, fontWeight: 950 }}>{completedStops.length}</div></div>
                  <div style={metricStyle}><p style={eyebrowStyle}>Saltati</p><div style={{ marginTop: 5, color: "#ffffff", fontSize: 25, fontWeight: 950 }}>{skippedStops.length}</div></div>
                </div>
              </div>

              <div style={navigationGridStyle}>
                <a href={getGoogleMapsUrl(currentStopLat, currentStopLng)} target="_blank" rel="noreferrer" style={{ ...routeProUi.primaryButton, ...navButtonStyle }}>
                  Apri Google Maps
                </a>
                <a href={getWazeUrl(currentStopLat, currentStopLng)} target="_blank" rel="noreferrer" style={{ ...routeProUi.secondaryButton, ...navButtonStyle, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(148,163,184,0.2)", color: "#ffffff" }}>
                  Apri Waze
                </a>
              </div>
            </section>

            {nextStop ? (
              <section style={nextCardStyle}>
                <p style={eyebrowStyle}>Prossimo stop</p>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
                  <span style={chipStyle}>Originale {nextStop.original_position}</span>
                  <span style={{ ...chipStyle, background: "#ffedd5", color: "#9a3412" }}>RoutePro {nextStop.position}</span>
                </div>
                <p style={{ margin: "13px 0 0", color: "#ffffff", fontSize: "clamp(20px,5vw,29px)", lineHeight: 1.2, fontWeight: 900, overflowWrap: "anywhere" }}>
                  {nextStop.address}
                </p>
              </section>
            ) : null}

            <div style={secondaryActionsStyle}>
              <form action={skipRouteProStop}>
                <input type="hidden" name="route_id" value={route.id} />
                <input type="hidden" name="stop_id" value={currentStop.id} />
                <button type="submit" style={{ ...routeProUi.secondaryButton, minHeight: 42, borderRadius: 13, background: "transparent", color: "#cbd5e1" }}>
                  Salta questo stop
                </button>
              </form>
            </div>
          </>
        )}

        <div style={secondaryActionsStyle}>
          <Link href={`/app/routepro/routes/${route.id}/optimize`} style={routeProUi.secondaryButton}>Torna a ottimizzazione</Link>
          <Link href={`/app/routepro/routes/${route.id}/summary`} style={routeProUi.secondaryButton}>Riepilogo</Link>
        </div>
      </RouteProWorkflowShell>

      {showActionDock ? (
        <div style={actionDockStyle}>
          <div style={actionDockInnerStyle}>
            <RouteProCompleteSlider action={completeRouteProStop} routeId={route.id} stopId={currentStop.id} />
          </div>
        </div>
      ) : null}
    </div>
  );
}