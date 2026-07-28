import Link from "next/link";
import { notFound } from "next/navigation";
import { optimizeRouteProRoute } from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import {
  buildDeliveryClusters,
  getMultiStopDeliveryClusters,
} from "@/modules/routepro/v2/domain/routepro.clusters";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    optimized?: string;
    error?: string;
  }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const cardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};

const whiteCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const valueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 950,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 950,
};

const sectionTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.6,
  fontWeight: 700,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 14,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const stopNumberStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 110,
  padding: "7px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 950,
};

const addressGroupStyle: React.CSSProperties = {
  flex: "1 1 240px",
  minWidth: 0,
};

const addressTextStyle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 850,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const mutedTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 750,
  overflowWrap: "anywhere",
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "#ecfdf5",
  color: "#047857",
  border: "1px solid #a7f3d0",
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  border: "1px solid #fecdd3",
  fontWeight: 700,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  fontSize: 12,
  fontWeight: 950,
};

const completedPanelStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 20,
  borderRadius: 22,
  background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
  border: "1px solid #86efac",
  boxShadow: "0 14px 32px rgba(22,101,52,0.08)",
};

const completedEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#047857",
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const completedTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#14532d",
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 950,
};

const completedListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  margin: "16px 0 0",
  padding: 0,
  listStyle: "none",
  color: "#166534",
  fontSize: 14,
  lineHeight: 1.45,
  fontWeight: 800,
};

const completedButtonStyle: React.CSSProperties = {
  ...routeProUi.secondaryButton,
  cursor: "default",
  opacity: 0.78,
  pointerEvents: "none",
};

const disabledButtonStyle: React.CSSProperties = {
  ...routeProUi.primaryButton,
  cursor: "not-allowed",
  opacity: 0.48,
  pointerEvents: "none",
};

function getOptimizationError(error?: string): string | null {
  if (error === "optimize-failed") {
    return "Ottimizzazione non riuscita. Controlla gli stop validi e riprova.";
  }

  if (error === "optimize-needs-review") {
    return "Alcuni stop devono ancora essere controllati prima dell’ottimizzazione.";
  }

  if (error === "optimize-not-enough-stops") {
    return "Servono almeno 2 stop validi per ottimizzare una rotta.";
  }

  return null;
}

export default async function RouteProOptimizePage({
  params,
  searchParams,
}: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const needsReviewStops = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;

  const optimizedStops = [...route.stops].sort(
    (a, b) => a.position - b.position,
  );

  const deliveryClusters = buildDeliveryClusters(optimizedStops);
  const multiStopClusters = getMultiStopDeliveryClusters(optimizedStops);
  const errorMessage = getOptimizationError(resolvedSearchParams?.error);
  const canOptimize = validStops >= 2 && needsReviewStops === 0;
  const optimizationCompleted =
    route.is_optimized || resolvedSearchParams?.optimized === "1";

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Optimize"
      title="Ottimizza percorso"
      subtitle="Prepara la sequenza migliore mantenendo ogni numero originale."
    >
      {resolvedSearchParams?.optimized === "1" ? (
        <div style={successStyle}>
          ✓ Percorso ottimizzato. Le posizioni RoutePro sono state aggiornate e
          i numeri originali sono stati preservati.
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={labelStyle}>Stop pronti</p>
          <h2 style={valueStyle}>{validStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Cluster</p>
          <h2 style={valueStyle}>{multiStopClusters.length}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Da correggere</p>
          <h2 style={valueStyle}>{needsReviewStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={labelStyle}>Ottimizzata</p>
          <h2 style={valueStyle}>{optimizationCompleted ? "SÌ" : "NO"}</h2>
        </article>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Ottimizza la rotta</h2>
        <p style={sectionTextStyle}>
          RoutePro ricalcola automaticamente la sequenza operativa migliore,
          senza eliminare stop e mantenendo sempre il numero originale dell’app
          di consegna.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 18,
          }}
        >
          {!optimizationCompleted ? (
            canOptimize ? (
              <form action={optimizeRouteProRoute}>
                <input type="hidden" name="route_id" value={route.id} />

                <RouteProSubmitButton
                  idleLabel="Ottimizza percorso"
                  pendingLabel="Ottimizzazione in corso..."
                />
              </form>
            ) : (
              <span style={disabledButtonStyle}>Ottimizzazione non disponibile</span>
            )
          ) : (
            <>
              <span style={completedButtonStyle}>✓ Percorso ottimizzato</span>

              <Link
                href={`/app/routepro/routes/${route.id}/drive`}
                style={routeProUi.primaryButton}
              >
                Avvia navigazione →
              </Link>
            </>
          )}
        </div>

        {!canOptimize && !optimizationCompleted ? (
          <div style={errorStyle}>
            Correggi gli stop segnalati e assicurati di avere almeno 2 stop
            validi prima di avviare l’ottimizzazione.
          </div>
        ) : null}

        {optimizationCompleted ? (
          <section style={completedPanelStyle}>
            <p style={completedEyebrowStyle}>Ottimizzazione completata</p>
            <h3 style={completedTitleStyle}>
              {validStops} stop pronti per la navigazione
            </h3>

            <ul style={completedListStyle}>
              <li>✓ Numerazione originale preservata</li>
              <li>✓ Cluster intelligenti applicati</li>
              <li>✓ Sequenza RoutePro aggiornata</li>
              <li>✓ Percorso pronto per il Driver Command Center</li>
            </ul>
          </section>
        ) : null}
      </div>

      <details style={{ marginTop: 28 }}>
        <summary
          style={{
            ...sectionTitleStyle,
            cursor: "pointer",
            listStyle: "none",
          }}
        >
          Delivery clusters ({multiStopClusters.length})
        </summary>

        <p style={sectionTextStyle}>
          Gli indirizzi ripetuti vengono raggruppati senza eliminare consegne.
        </p>

        {multiStopClusters.length === 0 ? (
          <div style={{ ...whiteCardStyle, marginTop: 18 }}>
            <p style={{ ...sectionTextStyle, margin: 0 }}>
              Nessun indirizzo ripetuto rilevato in questa rotta.
            </p>
          </div>
        ) : (
          <div style={listStyle}>
            {multiStopClusters.map((cluster) => (
              <article key={cluster.normalizedAddress} style={whiteCardStyle}>
                <div style={rowStyle}>
                  <span style={stopNumberStyle}>
                    Workflow #{cluster.workflowPosition}
                  </span>

                  <div style={addressGroupStyle}>
                    <div style={addressTextStyle}>{cluster.address}</div>
                    <div style={mutedTextStyle}>
                      Originali:{" "}
                      {cluster.stops
                        .map((stop) => stop.original_position)
                        .sort((a, b) => a - b)
                        .join(" · ")}
                    </div>
                  </div>

                  <span style={badgeStyle}>{cluster.stops.length} stop</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </details>

      <details style={{ marginTop: 28 }}>
        <summary
          style={{
            ...sectionTitleStyle,
            cursor: "pointer",
            listStyle: "none",
          }}
        >
          Anteprima percorso ({deliveryClusters.length})
        </summary>

        <p style={sectionTextStyle}>
          Apri questa sezione solo per controllare l’ordine completo prima della
          guida.
        </p>

        {deliveryClusters.length === 0 ? (
          <div style={{ ...whiteCardStyle, marginTop: 18 }}>
            <p style={{ ...sectionTextStyle, margin: 0 }}>
              Nessuno stop disponibile. Importa e verifica gli stop prima di
              ottimizzare.
            </p>
          </div>
        ) : (
          <div style={listStyle}>
            {deliveryClusters.map((cluster) => (
              <article key={cluster.normalizedAddress} style={whiteCardStyle}>
                <div style={rowStyle}>
                  <span style={stopNumberStyle}>
                    Workflow #{cluster.workflowPosition}
                  </span>

                  <div style={addressGroupStyle}>
                    <div style={addressTextStyle}>{cluster.address}</div>
                    <div style={mutedTextStyle}>
                      Originali:{" "}
                      {cluster.stops
                        .map((stop) => stop.original_position)
                        .sort((a, b) => a - b)
                        .join(" · ")}
                    </div>
                  </div>

                  <span style={badgeStyle}>
                    {cluster.stops.length > 1 ? "Cluster" : "Stop"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </details>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}
      >
        {optimizationCompleted ? (
          <Link
            href={`/app/routepro/routes/${route.id}/drive`}
            style={routeProUi.primaryButton}
          >
            Avvia navigazione →
          </Link>
        ) : (
          <span style={disabledButtonStyle}>Ottimizza prima</span>
        )}

        <Link
          href={`/app/routepro/routes/${route.id}/verify`}
          style={routeProUi.secondaryButton}
        >
          Torna a Verify
        </Link>

        <Link
          href={`/app/routepro/${route.id}`}
          style={routeProUi.secondaryButton}
        >
          Vista completa rotta
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}