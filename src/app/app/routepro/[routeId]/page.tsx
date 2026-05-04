import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addBulkRouteProStops,
  addCsvRouteProStops,
  addManualRouteProStop,
  addScreenshotOcrRouteProStops,
  deleteRouteProRoute,
  deleteRouteProStop,
  geocodeRouteProStops,
  optimizeRouteProRoute,
  previewRouteProScreenshotOcr,
  updateRouteProStopAddress,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    geocoded?: string;
    updated?: string;
    deleted?: string;
    optimized?: string;
    csvImported?: string;
    ocrPreview?: string;
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
  marginTop: 8,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
};

const pageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 24,
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
  if (error === "screenshot-missing") return "Carica almeno uno screenshot prima di avviare OCR.";
  if (error === "ocr-missing-key") return "Per usare OCR devi salvare una API key Google Vision nelle impostazioni.";
  if (error === "ocr-failed") return "Non siamo riusciti a leggere lo screenshot. Prova con un'immagine più chiara.";
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
  const ocrPreview = resolvedSearchParams?.ocrPreview
    ? decodeURIComponent(resolvedSearchParams.ocrPreview)
    : null;

  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;
  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const needsReviewCount = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>RoutePro</p>
      <h1 style={ui.page.title}>{route.name}</h1>
      <p style={ui.page.subtitle}>
        Data: {route.route_date} · Stato: {route.status}
      </p>

      <div style={actionsStyle}>
        <Link href="/app/routepro" style={ui.button.secondary}>
          Torna alle rotte
        </Link>

        <Link href={`/app/routepro/${route.id}/execute`} style={ui.button.primary}>
          Execution mode
        </Link>

        <Link href="/app/routepro/settings" style={ui.button.secondary}>
          Impostazioni API
        </Link>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {geocoded === "1" ? (
        <div style={successStyle}>Geocoding completato. Controlla eventuali stop da rivedere.</div>
      ) : null}

      {updated === "1" ? (
        <div style={successStyle}>Stop aggiornato. Rilancia il geocoding per validarlo.</div>
      ) : null}

      {deleted === "1" ? <div style={successStyle}>Stop eliminato correttamente.</div> : null}

      {optimized === "1" ? (
        <div style={successStyle}>Rotta ottimizzata. L’ordine degli stop è stato aggiornato.</div>
      ) : null}

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
        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Stop totali</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Validi</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{validStops}</h2>
        </article>

        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Da rivedere</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{needsReviewCount}</h2>
        </article>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>1. Import stop</h2>

        <div style={pageGridStyle}>
          <div style={ui.card.base}>
            <h3 style={{ marginTop: 0 }}>Aggiungi stop manuale</h3>

            <form action={addManualRouteProStop} style={formStyle}>
              <input type="hidden" name="route_id" value={route.id} />

              <label style={ui.form.label}>
                Indirizzo
                <input
                  name="address"
                  type="text"
                  placeholder="Esempio: Via Roma 10, Milano"
                  style={ui.form.input}
                />
              </label>

              <button type="submit" style={ui.button.primary}>
                Aggiungi stop
              </button>
            </form>
          </div>

          <div style={ui.card.base}>
            <h3 style={{ marginTop: 0 }}>Incolla lista indirizzi</h3>

            <form action={addBulkRouteProStops} style={formStyle}>
              <input type="hidden" name="route_id" value={route.id} />

              <label style={ui.form.label}>
                Indirizzi uno per riga
                <textarea
                  name="bulk_addresses"
                  rows={6}
                  placeholder={`Via Roma 10, Milano
Via Torino 5, Milano
Corso Buenos Aires 22, Milano`}
                  style={{ ...ui.form.input, resize: "vertical" }}
                />
              </label>

              <button type="submit" style={ui.button.primary}>
                Importa lista
              </button>
            </form>
          </div>

          <div style={ui.card.base}>
            <h3 style={{ marginTop: 0 }}>Import CSV</h3>
            <p style={mutedTextStyle}>
              CSV con colonna obbligatoria <strong>address</strong>.
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

              <button type="submit" style={ui.button.primary}>
                Importa CSV
              </button>
            </form>
          </div>
        </div>

        <div style={{ ...ui.card.base, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Import screenshot OCR</h3>
          <p style={mutedTextStyle}>
            Carica più screenshot insieme. RoutePro estrarrà stop originali e indirizzi,
            poi potrai controllare tutto prima dell’import.
          </p>

          <form action={previewRouteProScreenshotOcr} style={formStyle}>
            <input type="hidden" name="route_id" value={route.id} />

            <label style={ui.form.label}>
              Screenshot
              <input
                name="screenshot_file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                style={ui.form.input}
              />
            </label>

            <button type="submit" style={ui.button.primary}>
              Leggi screenshot selezionati
            </button>
          </form>

          {ocrPreview ? (
            <div style={{ ...ui.card.base, marginTop: 18 }}>
              <h3 style={{ marginTop: 0 }}>Preview OCR pulita</h3>
              <p style={mutedTextStyle}>
                Controlla le righe, elimina eventuali errori e poi conferma l’import.
              </p>

              <form action={addScreenshotOcrRouteProStops} style={formStyle}>
                <input type="hidden" name="route_id" value={route.id} />

                <label style={ui.form.label}>
                  Stop da importare
                  <textarea
                    name="ocr_addresses"
                    rows={10}
                    defaultValue={ocrPreview}
                    style={{
                      ...ui.form.input,
                      resize: "vertical",
                      fontFamily: "monospace",
                    }}
                  />
                </label>

                <button type="submit" style={ui.button.primary}>
                  Importa stop da screenshot
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>2. Prepara rotta</h2>

        <div style={pageGridStyle}>
          <div style={ui.card.base}>
            <h3 style={{ marginTop: 0 }}>Geocoding</h3>
            <p style={mutedTextStyle}>
              Trasforma gli indirizzi importati in coordinate. Gli stop non riconosciuti
              passeranno in revisione.
            </p>

            <form action={geocodeRouteProStops} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <button type="submit" style={ui.button.primary}>
                Geocodifica stop
              </button>
            </form>
          </div>

          <div style={ui.card.base}>
            <h3 style={{ marginTop: 0 }}>Ottimizzazione</h3>
            <p style={mutedTextStyle}>
              Riordina gli stop validi per ridurre zig-zag evidenti. L’ordine originale
              resta salvato.
            </p>

            <form action={optimizeRouteProRoute} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <button type="submit" style={ui.button.primary}>
                Ottimizza rotta
              </button>
            </form>

            {route.is_optimized ? (
              <p style={mutedTextStyle}>
                Ultima ottimizzazione: {route.optimized_at ?? "completata"}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>3. Stop importati</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              Nessuno stop inserito. Importa una lista, un CSV o screenshot per iniziare.
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
                    <button type="submit" style={ui.button.secondary}>
                      Aggiorna stop
                    </button>
                  </div>
                </form>

                <form action={deleteRouteProStop} style={{ marginTop: 12 }}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={stop.id} />

                  <button type="submit" style={ui.button.danger}>
                    Elimina stop
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...ui.card.base, marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>Zona pericolosa</h2>
        <p style={mutedTextStyle}>
          Cancella definitivamente questa rotta e tutti gli stop collegati. Questa azione
          non può essere annullata.
        </p>

        <form action={deleteRouteProRoute} style={{ marginTop: 16 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <button type="submit" style={ui.button.danger}>
            Cancella rotta
          </button>
        </form>
      </div>
    </section>
  );
}