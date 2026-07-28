import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
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

const dashboardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const metricCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: 118,
  padding: 17,
  borderRadius: 20,
  background:
    "linear-gradient(180deg,rgba(30,41,59,0.96) 0%,rgba(15,23,42,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.075)",
  boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
};

const metricLabelStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const metricValueStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.045em",
};

const metricDetailStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 700,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "clamp(21px, 2.5vw, 26px)",
  lineHeight: 1.15,
  fontWeight: 950,
  letterSpacing: "-0.025em",
};

const mutedTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#aebdd0",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 650,
};

const emptyCardStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 18,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.2)",
};

const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: "#e2e8f0",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 700,
};

const successStyle: CSSProperties = {
  marginTop: 16,
  padding: "13px 15px",
  borderRadius: 16,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(74,222,128,0.22)",
  color: "#d1fae5",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 800,
};

const errorStyle: CSSProperties = {
  marginTop: 16,
  padding: "13px 15px",
  borderRadius: 16,
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(248,113,113,0.24)",
  color: "#fecaca",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 800,
};

const actionCardStyle: CSSProperties = {
  marginTop: 18,
  padding: "18px clamp(16px, 2.5vw, 22px)",
  borderRadius: 20,
  background:
    "radial-gradient(circle at 100% 0%,rgba(249,115,22,0.15) 0%,transparent 38%),linear-gradient(135deg,rgba(30,41,59,0.98) 0%,rgba(15,23,42,0.98) 100%)",
  border: "1px solid rgba(251,146,60,0.24)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.2)",
};

const footerStyle: CSSProperties = {
  position: "sticky",
  bottom: 12,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 26,
  padding: 12,
  borderRadius: 18,
  background: "rgba(15,23,42,0.92)",
  border: "1px solid rgba(148,163,184,0.2)",
  boxShadow: "0 18px 46px rgba(0,0,0,0.34)",
  backdropFilter: "blur(16px)",
};

function getErrorMessage(error?: string): string | null {
  if (error === "geocode-failed") {
    return "La verifica degli indirizzi non è riuscita. Controlla la configurazione e riprova.";
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

  const hasCoordinates = (stop: (typeof route.stops)[number]) =>
    typeof stop.lat === "number" &&
    Number.isFinite(stop.lat) &&
    typeof stop.lng === "number" &&
    Number.isFinite(stop.lng);

  const geolocatedStops = route.stops.filter(
    (stop) => stop.status === "valid" && hasCoordinates(stop),
  ).length;

  const needsReviewStops = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;

  const rawStops = route.stops.filter(
    (stop) => stop.status === "raw",
  ).length;

  const missingCoordinatesStops = route.stops.filter(
    (stop) => !hasCoordinates(stop),
  ).length;

  const addressesToVerify = route.stops.filter(
    (stop) =>
      stop.status === "needs_review" ||
      stop.status === "raw" ||
      !hasCoordinates(stop),
  ).length;

  const verificationProgress =
    totalStops > 0
      ? Math.round((geolocatedStops / totalStops) * 100)
      : 0;

  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  const canContinueToOptimize =
    totalStops >= 2 &&
    geolocatedStops === totalStops &&
    addressesToVerify === 0;

  const statusAccent = canContinueToOptimize ? "#4ade80" : "#fbbf24";
  const statusBackground = canContinueToOptimize
    ? "rgba(34,197,94,0.09)"
    : "rgba(245,158,11,0.09)";
  const statusBorder = canContinueToOptimize
    ? "1px solid rgba(74,222,128,0.24)"
    : "1px solid rgba(251,191,36,0.24)";

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Verify"
      title="Verifica indirizzi"
      subtitle="RoutePro controlla che ogni indirizzo possa essere geolocalizzato prima dell'ottimizzazione della rotta."
    >
      {resolvedSearchParams?.geocoded === "1" ? (
        <div style={successStyle}>
          Verifica completata. Controlla gli eventuali indirizzi che richiedono ancora attenzione.
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <div style={dashboardGridStyle}>
        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Stop totali</p>
          <h2 style={metricValueStyle}>{totalStops}</h2>
          <p style={metricDetailStyle}>Indirizzi presenti nella rotta</p>
        </article>

        <article style={metricCardStyle}>
          <p style={{ ...metricLabelStyle, color: "#86efac" }}>
            Geolocalizzati
          </p>
          <h2 style={metricValueStyle}>{geolocatedStops}</h2>
          <p style={metricDetailStyle}>Pronti per l'ottimizzazione</p>
        </article>

        <article style={metricCardStyle}>
          <p style={{ ...metricLabelStyle, color: "#fcd34d" }}>
            Da verificare
          </p>
          <h2 style={metricValueStyle}>{addressesToVerify}</h2>
          <p style={metricDetailStyle}>
            {needsReviewStops + rawStops} con stato da controllare
          </p>
        </article>

        <article style={metricCardStyle}>
          <p style={{ ...metricLabelStyle, color: "#93c5fd" }}>
            Avanzamento
          </p>
          <h2 style={metricValueStyle}>{verificationProgress}%</h2>
          <p style={metricDetailStyle}>
            {missingCoordinatesStops} senza coordinate
          </p>
        </article>
      </div>

      <section
        style={{
          marginTop: 18,
          padding: "20px clamp(17px, 3vw, 25px)",
          borderRadius: 22,
          background: statusBackground,
          border: statusBorder,
          boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: statusAccent,
                fontSize: 10,
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: "0.11em",
              }}
            >
              {canContinueToOptimize ? "Verifica completata" : "Verifica richiesta"}
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                color: "#ffffff",
                fontSize: "clamp(23px, 3vw, 31px)",
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: "-0.035em",
              }}
            >
              {canContinueToOptimize
                ? "La rotta è pronta"
                : `${addressesToVerify} indirizzi richiedono attenzione`}
            </h2>

            <p style={mutedTextStyle}>
              {canContinueToOptimize
                ? `Tutti i ${geolocatedStops} indirizzi dispongono di coordinate valide. Puoi procedere con l'ottimizzazione.`
                : `${geolocatedStops} indirizzi sono già pronti. Avvia la verifica automatica per completare la rotta.`}
            </p>
          </div>

          <div
            style={{
              flex: "0 0 auto",
              minWidth: 118,
              textAlign: "right",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: 34,
                lineHeight: 1,
                fontWeight: 950,
                letterSpacing: "-0.045em",
              }}
            >
              {verificationProgress}%
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {geolocatedStops} / {totalStops} pronti
            </div>
          </div>
        </div>

        <div
          aria-label={`Verifica completata al ${verificationProgress}%`}
          style={{
            height: 9,
            marginTop: 18,
            overflow: "hidden",
            borderRadius: 999,
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(148,163,184,0.16)",
          }}
        >
          <div
            style={{
              width: `${verificationProgress}%`,
              height: "100%",
              borderRadius: 999,
              background: canContinueToOptimize
                ? "linear-gradient(90deg,#22c55e 0%,#4ade80 100%)"
                : "linear-gradient(90deg,#f97316 0%,#fbbf24 100%)",
              transition: "width 240ms ease",
            }}
          />
        </div>
      </section>

      {!canContinueToOptimize ? (
        <section style={actionCardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  color: "#fdba74",
                  fontSize: 10,
                  fontWeight: 950,
                  textTransform: "uppercase",
                  letterSpacing: "0.11em",
                }}
              >
                Azione principale
              </p>

              <h2
                style={{
                  ...sectionTitleStyle,
                  marginTop: 7,
                  fontSize: "clamp(20px, 2.4vw, 25px)",
                }}
              >
                Completa la geolocalizzazione
              </h2>

              <p style={mutedTextStyle}>
                RoutePro associa automaticamente coordinate valide agli indirizzi ancora in attesa.
              </p>
            </div>

            <form action={geocodeRouteProStops}>
              <input type="hidden" name="route_id" value={route.id} />

              <RouteProSubmitButton
                idleLabel="Avvia verifica indirizzi"
                pendingLabel="Verifica in corso..."
              />
            </form>
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: 28 }}>
        <div
          style={{
            paddingBottom: 14,
            borderBottom: "1px solid rgba(148,163,184,0.14)",
          }}
        >
          <h2 style={sectionTitleStyle}>Stato degli indirizzi</h2>

          <p style={mutedTextStyle}>
            Cerca uno stop, controlla gli indirizzi da verificare oppure consulta quelli già pronti.
          </p>
        </div>

        {route.stops.length === 0 ? (
          <div style={emptyCardStyle}>
            <p style={emptyTextStyle}>
              Non sono presenti stop. Importa gli indirizzi prima di avviare la verifica.
            </p>
          </div>
        ) : (
          <RouteProVerifyStopsClient stops={route.stops} />
        )}
      </section>

      <footer style={footerStyle}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 9,
          }}
        >
          <Link
            href={`/app/routepro/routes/${route.id}/review`}
            style={{
              ...routeProUi.secondaryButton,
              minHeight: 40,
              padding: "0 14px",
              fontSize: 13,
            }}
          >
            Torna alla Review
          </Link>

          <Link
            href={`/app/routepro/${route.id}`}
            style={{
              ...routeProUi.secondaryButton,
              minHeight: 40,
              padding: "0 14px",
              fontSize: 13,
            }}
          >
            Vista classica
          </Link>
        </div>

        {canContinueToOptimize ? (
          <Link
            href={`/app/routepro/routes/${route.id}/optimize`}
            style={{
              ...routeProUi.primaryButton,
              minHeight: 44,
              padding: "0 20px",
            }}
          >
            Ottimizza percorso
          </Link>
        ) : (
          <span
            aria-disabled="true"
            style={{
              ...routeProUi.primaryButton,
              minHeight: 44,
              padding: "0 20px",
              opacity: 0.42,
              cursor: "not-allowed",
              pointerEvents: "none",
            }}
          >
            Completa la verifica
          </span>
        )}
      </footer>
    </RouteProWorkflowShell>
  );
}
