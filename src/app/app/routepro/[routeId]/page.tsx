import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addBulkRouteProStops,
  addCsvRouteProStops,
  addManualRouteProStop,
  deleteRouteProRoute,
  deleteRouteProStop,
  geocodeRouteProStops,
  optimizeRouteProRoute,
  updateRouteProStopAddress,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { RouteProOcrBatchUploader } from "@/modules/routepro/ui/RouteProOcrBatchUploader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";
import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import { RouteProWorkflowHeader } from "@/modules/routepro/v2/ui/RouteProWorkflowHeader";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    geocoded?: string;
    updated?: string;
    deleted?: string;
    optimized?: string;
    csvImported?: string;
    screenshotImported?: string;
  }>;
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 18,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 12,
};

const pageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 16,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
};

const compactCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 18,
};

const stopListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 18,
};

const stopRowStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 16,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: "#f1f5f9",
  color: "#334155",
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 600,
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf5",
  color: "#047857",
  fontWeight: 600,
};

function getErrorMessage(error?: string): string | null {
  if (error === "missing-address") return "Inserisci un indirizzo prima di aggiungere lo stop.";
  if (error === "add-stop-failed") return "Non siamo riusciti ad aggiungere lo stop. Riprova.";
  if (error === "geocode-failed") return "Non siamo riusciti a geocodificare gli stop. Riprova.";
  if (error === "update-stop-failed") return "Non siamo riusciti ad aggiornare lo stop. Riprova.";
  if (error === "delete-stop-failed") return "Non siamo riusciti a eliminare lo stop. Riprova.";
  if (error === "optimize-failed") return "Non siamo riusciti a ottimizzare la rotta. Riprova.";
  if (error === "optimize-needs-review") return "Prima di ottimizzare devi correggere tutti gli stop da rivedere.";
  if (error === "optimize-not-enough-stops") return "Servono almeno 2 stop validi per ottimizzare la rotta.";
  if (error === "csv-missing") return "Carica un file CSV prima di importare.";
  if (error === "csv-invalid") return "Il CSV non è valido. Usa una riga header e almeno un indirizzo.";
  if (error === "csv-missing-address-column") return "Il CSV deve contenere una colonna chiamata address.";
  if (error === "csv-failed") return "Non siamo riusciti a importare il CSV. Riprova.";
  if (error === "ocr-import-empty") return "Non ci sono righe OCR da importare.";
  if (error === "ocr-import-failed") return "Non siamo riusciti a importare gli stop dallo screenshot.";
  if (error === "delete-route-failed") return "Non siamo riusciti a cancellare la rotta. Riprova.";

  return null;
}

export default async function RouteProRoutePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;

  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const geocoded = resolvedSearchParams?.geocoded;
  const updated = resolvedSearchParams?.updated;
  const deleted = resolvedSearchParams?.deleted;
  const optimized = resolvedSearchParams?.optimized;
  const csvImported = resolvedSearchParams?.csvImported;
  const screenshotImported = resolvedSearchParams?.screenshotImported;

  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;
  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const rawStops = route.stops.filter((stop) => stop.status === "raw").length;
  const needsReviewCount = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;

  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Import your stops. Review your route. Drive smarter." />

<RouteProWorkflowHeader
  steps={[
    { label: "Import", status: totalStops > 0 ? "completed" : "current" },
    { label: "Extract", status: totalStops > 0 ? "completed" : "pending" },
    {
      label: "Review",
      status: needsReviewCount > 0 ? "current" : totalStops > 0 ? "completed" : "pending",
    },
    {
      label: "Verify",
      status: rawStops > 0 ? "current" : validStops > 0 ? "completed" : "pending",
    },
    {
      label: "Optimize",
      status: route.is_optimized ? "completed" : validStops >= 2 ? "current" : "pending",
    },
    {
      label: "Drive",
      status: route.is_optimized ? "current" : "pending",
    },
    {
      label: "Summary",
      status: route.status === "completed" ? "completed" : "pending",
    },
  ]}
/>

      <p style={ui.page.eyebrow}>RoutePro</p>
      <h1 style={ui.page.title}>{route.name}</h1>
      <p style={ui.page.subtitle}>
        Data: {route.route_date} · Stato: {route.status}
      </p>

      <div style={actionsStyle}>
        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Rotte
        </Link>

        <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.primaryButton}>
          Avvia percorso
        </Link>

        <Link href="/app/routepro/settings" style={routeProUi.secondaryButton}>
          API
        </Link>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {geocoded === "1" ? <div style={successStyle}>Geocoding completato. Controlla eventuali stop da rivedere.</div> : null}
      {updated === "1" ? <div style={successStyle}>Stop aggiornato. Rilancia il geocoding per validarlo.</div> : null}
      {deleted === "1" ? <div style={successStyle}>Stop eliminato correttamente.</div> : null}
      {optimized === "1" ? <div style={successStyle}>Rotta ottimizzata. L’ordine degli stop è stato aggiornato.</div> : null}
      {csvImported === "1" ? <div style={successStyle}>CSV importato correttamente.</div> : null}
      {screenshotImported === "1" ? (
        <div style={successStyle}>
          Stop importati dallo screenshot. Ora puoi controllarli e geocodificarli.
        </div>
      ) : null}

      {needsReviewCount > 0 ? (
        <div style={errorStyle}>
          {needsReviewCount} stop da rivedere prima di ottimizzare o partire.
        </div>
      ) : null}

      <div style={pageGridStyle}>
        <article style={compactCardStyle}>
          <p style={ui.page.eyebrow}>Totali</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={compactCardStyle}>
          <p style={ui.page.eyebrow}>Da geocodificare</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{rawStops}</h2>
        </article>

        <article style={compactCardStyle}>
          <p style={ui.page.eyebrow}>Validi</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{validStops}</h2>
        </article>
      </div>

      <RouteProOcrBatchUploader routeId={route.id} />

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Altri metodi di import</h2>

        <div style={pageGridStyle}>
          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>Manuale</h3>

            <form action={addManualRouteProStop} style={formStyle}>
              <input type="hidden" name="route_id" value={route.id} />

              <label style={ui.form.label}>
                Indirizzo
                <input
                  name="address"
                  type="text"
                  placeholder="Via Roma 10, Milano"
                  style={ui.form.input}
                />
              </label>

              <button type="submit" style={routeProUi.primaryButton}>
                Aggiungi
              </button>
            </form>
          </div>

          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>Lista</h3>

            <form action={addBulkRouteProStops} style={formStyle}>
              <input type="hidden" name="route_id" value={route.id} />

              <label style={ui.form.label}>
                Uno per riga
                <textarea
                  name="bulk_addresses"
                  rows={5}
                  placeholder={`Via Roma 10, Milano
Via Torino 5, Milano`}
                  style={{ ...ui.form.input, resize: "vertical" }}
                />
              </label>

              <button type="submit" style={routeProUi.primaryButton}>
                Importa lista
              </button>
            </form>
          </div>

          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>CSV</h3>
            <p style={mutedTextStyle}>
              Colonna obbligatoria <strong>address</strong>.
            </p>

            <form action={addCsvRouteProStops} style={formStyle}>
              <input type="hidden" name="route_id" value={route.id} />

              <label style={ui.form.label}>
                File CSV
                <input
                  name="csv_file"
                  type="file"
                  accept=".csv,text/csv"
                  style={ui.form.input}
                />
              </label>

              <RouteProSubmitButton
  idleLabel="Importa CSV"
  pendingLabel="Import CSV in corso..."
/>
            </form>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Route workflow</h2>

        <div style={pageGridStyle}>
          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>Verify addresses</h3>
            <p style={mutedTextStyle}>
              Trasforma gli indirizzi in coordinate e segnala gli stop da rivedere.
            </p>

            <form action={geocodeRouteProStops} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <RouteProSubmitButton
  idleLabel="Riconosci indirizzi"
  pendingLabel="Riconoscimento in corso..."
/>
            </form>
          </div>

          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>Optimize route</h3>
            <p style={mutedTextStyle}>
              Riordina gli stop validi mantenendo sempre il numero originale.
            </p>

            <form action={optimizeRouteProRoute} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <RouteProSubmitButton
  idleLabel="Ottimizza"
  pendingLabel="Ottimizzazione in corso..."
/>
            </form>

            {route.is_optimized ? (
              <p style={mutedTextStyle}>
                Ultima ottimizzazione: {route.optimized_at ?? "completata"}
              </p>
            ) : null}
          </div>

          <div style={compactCardStyle}>
            <h3 style={{ marginTop: 0 }}>Drive route</h3>
            <p style={mutedTextStyle}>
              Apri la modalità driver con Maps/Waze, complete e skip.
            </p>

            <div style={actionsStyle}>
              <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.primaryButton}>
                Avvia percorso
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Stop importati</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              Nessuno stop inserito. Carica screenshot, lista o CSV per iniziare.
            </p>
          </div>
        ) : (
          <div style={stopListStyle}>
            {route.stops.map((stop) => (
              <article key={stop.id} style={stopRowStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <strong>
                    #{stop.position} (orig: {stop.original_position}) · {stop.address}
                  </strong>
                  <span style={badgeStyle}>{stop.status}</span>
                </div>

                <p style={mutedTextStyle}>Fonte: {stop.source}</p>

                {stop.lat && stop.lng ? (
                  <p style={mutedTextStyle}>
                    Coordinate: {stop.lat}, {stop.lng}
                  </p>
                ) : null}

                <form action={updateRouteProStopAddress} style={formStyle}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={stop.id} />

                  <label style={ui.form.label}>
                    Modifica indirizzo
                    <input
                      name="address"
                      type="text"
                      defaultValue={stop.address}
                      style={ui.form.input}
                    />
                  </label>

                  <div style={actionsStyle}>
                    <RouteProSubmitButton
  idleLabel="Aggiorna"
  pendingLabel="Aggiornamento..."
  variant="secondary"
/>
                  </div>
                </form>

                <form action={deleteRouteProStop} style={{ marginTop: 12 }}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={stop.id} />

                  <RouteProSubmitButton
  idleLabel="Elimina"
  pendingLabel="Eliminazione..."
  variant="danger"
/>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...ui.card.base, marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>Zona pericolosa</h2>
        <p style={mutedTextStyle}>
          Cancella definitivamente questa rotta e tutti gli stop collegati.
        </p>

        <form action={deleteRouteProRoute} style={{ marginTop: 16 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <RouteProSubmitButton
  idleLabel="Cancella rotta"
  pendingLabel="Cancellazione..."
  variant="danger"
/>
        </form>
      </div>
    </section>
  );
}