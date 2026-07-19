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
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const valueStyle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#ffffff",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 950,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.6,
  fontWeight: 700,
};

const emptyCardStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#e2e8f0",
  fontSize: 15,
  lineHeight: 1.55,
  fontWeight: 700,
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(74,222,128,0.22)",
  color: "#d1fae5",
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(248,113,113,0.24)",
  color: "#fecaca",
  fontWeight: 800,
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

const errorMessage = getErrorMessage(resolvedSearchParams?.error);

const canContinueToOptimize =
  totalStops >= 2 &&
  geolocatedStops === totalStops &&
  addressesToVerify === 0;

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Verify"
      title="Verifica indirizzi"
      subtitle="RoutePro controlla che ogni indirizzo possa essere geolocalizzato prima dell’ottimizzazione della rotta."
    >
      {resolvedSearchParams?.geocoded === "1" ? (
        <div style={successStyle}>
          Verifica completata. Controlla gli eventuali indirizzi ancora privi di coordinate.
        </div>
      ) : null}

      {errorMessage ? (
        <div style={errorStyle}>{errorMessage}</div>
      ) : null}

      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={labelStyle}>Stop totali</p>
          <h2 style={valueStyle}>{totalStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Geolocalizzati</p>
          <h2 style={valueStyle}>{geolocatedStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Da verificare</p>
          <h2 style={valueStyle}>{addressesToVerify}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>In attesa</p>
          <h2 style={valueStyle}>{missingCoordinatesStops}</h2>
        </article>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 22,
          background: canContinueToOptimize
            ? "rgba(34,197,94,0.1)"
            : "rgba(245,158,11,0.1)",
          border: canContinueToOptimize
            ? "1px solid rgba(74,222,128,0.24)"
            : "1px solid rgba(251,191,36,0.24)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: canContinueToOptimize ? "#86efac" : "#fcd34d",
            fontSize: 11,
            fontWeight: 950,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
          }}
        >
          Stato verifica
        </p>

        <h3
          style={{
            margin: "8px 0 0",
            color: "#ffffff",
            fontSize: 24,
            lineHeight: 1.1,
            fontWeight: 950,
          }}
        >
          {canContinueToOptimize
            ? "Indirizzi verificati"
            : "Completa la geolocalizzazione"}
        </h3>

        <p style={mutedTextStyle}>
          {canContinueToOptimize
  ? `Tutti i ${geolocatedStops} indirizzi sono stati geolocalizzati. Puoi procedere con l’ottimizzazione della rotta.`
  : `${addressesToVerify} indirizzi da geolocalizzare e ${geolocatedStops} già pronti.`}
        </p>
      </div>

      {!canContinueToOptimize ? (
  <section style={{ marginTop: 28 }}>
    <h2 style={sectionTitleStyle}>Verifica geolocalizzazione</h2>

    <p style={mutedTextStyle}>
      Avvia il controllo automatico per associare coordinate valide agli
      indirizzi della rotta.
    </p>

    <form action={geocodeRouteProStops} style={{ marginTop: 18 }}>
      <input type="hidden" name="route_id" value={route.id} />

      <RouteProSubmitButton
        idleLabel="Avvia verifica indirizzi"
        pendingLabel="Verifica in corso..."
      />
    </form>
  </section>
) : null}

      <section style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Stato degli indirizzi</h2>

        <p style={mutedTextStyle}>
          Controlla gli indirizzi non ancora geolocalizzati oppure consulta quelli già pronti.
        </p>

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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}
      >
        {canContinueToOptimize ? (
          <Link
            href={`/app/routepro/routes/${route.id}/optimize`}
            style={routeProUi.primaryButton}
          >
            Ottimizza percorso
          </Link>
        ) : (
          <span
            style={{
              ...routeProUi.primaryButton,
              opacity: 0.45,
              cursor: "not-allowed",
              pointerEvents: "none",
            }}
          >
            Completa la verifica
          </span>
        )}

        <Link
          href={`/app/routepro/routes/${route.id}/review`}
          style={routeProUi.secondaryButton}
        >
          Torna alla Review
        </Link>

        <Link
          href={`/app/routepro/${route.id}`}
          style={routeProUi.secondaryButton}
        >
          Vista classica
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}