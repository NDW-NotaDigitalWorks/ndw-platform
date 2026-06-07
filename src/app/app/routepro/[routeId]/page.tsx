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
  color: "#334155",
  fontWeight: 600,
};

const compactCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 18,
};

const kpiCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 20,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
};

const kpiLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#475569",
};

const kpiValueStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 38,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const kpiHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 700,
  color: "#334155",
};

const heroCardStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 20,
  marginBottom: 24,
  padding: 24,
  border: "1px solid #1e40af",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.92) 100%)",
};

const heroTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(36px, 5vw, 56px)",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.05em",
  color: "#ffffff",
};

const heroSubtitleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 16,
  lineHeight: 1.6,
  fontWeight: 600,
  color: "rgba(255,255,255,0.85)",
};

const heroStatsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18,
};

const heroBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 800,
};

const stopListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 18,
};

const stopRowStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 18,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const stopCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const stopNumberGroupStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
};

const amazonStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.02em",
};

const optimizedStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.02em",
};

const stopAddressStyle: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 20,
  lineHeight: 1.35,
  fontWeight: 900,
  color: "#0f172a",
};

const stopMetaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const stopMetaItemStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

const stopEditPanelStyle: React.CSSProperties = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: "1px solid #e2e8f0",
};

const stopActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 12,
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

function getTimeMinutes(value?: string | null): number | null {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getAvailableShiftMinutes(
  shiftStartTime?: string | null,
  shiftEndTime?: string | null,
  breakMinutes?: number | null,
): number | null {
  const start = getTimeMinutes(shiftStartTime);
  const end = getTimeMinutes(shiftEndTime);

  if (start === null || end === null) return null;

  const rawMinutes = end > start ? end - start : end + 1440 - start;
  const pause = breakMinutes ?? 0;

  return Math.max(rawMinutes - pause, 0);
}

function getRequiredStopsPerHour(stops: number, availableMinutes: number | null): number | null {
  if (availableMinutes === null || availableMinutes <= 0) return null;

  return Math.round((stops / (availableMinutes / 60)) * 10) / 10;
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  if (status === "completed") {
    return {
      ...badgeStyle,
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "needs_review") {
    return {
      ...badgeStyle,
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "valid") {
    return {
      ...badgeStyle,
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  if (status === "skipped") {
    return {
      ...badgeStyle,
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return badgeStyle;
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

  const availableShiftMinutes = getAvailableShiftMinutes(
  route.shift_start_time,
  route.shift_end_time,
  route.break_minutes,
);

const requiredStopsPerHour = getRequiredStopsPerHour(
  validStops,
  availableShiftMinutes,
);

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

      <div style={heroCardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#93c5fd",
          }}
        >
          RoutePro Command Center
        </p>

        <h1 style={heroTitleStyle}>{route.name}</h1>

        <p style={heroSubtitleStyle}>
          Review your route. Verify addresses. Optimize stops. Drive smarter.
        </p>

        <div style={heroStatsStyle}>
          <div style={heroBadgeStyle}>{totalStops} Stops</div>
          <div style={heroBadgeStyle}>Status: {route.status}</div>
          <div style={heroBadgeStyle}>Date: {route.route_date}</div>
          <div style={heroBadgeStyle}>
  Profile: {route.route_profile ?? "generic"}
</div>

{route.shift_start_time || route.shift_end_time ? (
  <div style={heroBadgeStyle}>
    Shift: {route.shift_start_time ?? "—"} - {route.shift_end_time ?? "—"}
  </div>
) : null}

<div style={heroBadgeStyle}>
  Break: {route.break_minutes ?? 0} min
</div>

          {route.is_optimized ? <div style={heroBadgeStyle}>Optimized</div> : null}
        </div>
      </div>

      <div style={actionsStyle}>
        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Rotte
        </Link>

        <Link href={`/app/routepro/routes/${route.id}/review`} style={routeProUi.primaryButton}>
          Apri Workflow V2
        </Link>

        <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.secondaryButton}>
          Avvia percorso classico
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

      <div style={{ ...ui.card.base, marginBottom: 24, padding: 20 }}>
  <h2 style={ui.page.sectionTitle}>Route profile</h2>

  <p style={mutedTextStyle}>
    Start: <strong>{route.start_address ?? "Not set"}</strong>
  </p>

  <p style={mutedTextStyle}>
    Return: <strong>{route.return_address ?? "Not set"}</strong>
  </p>

  <p style={mutedTextStyle}>
    Shift: <strong>{route.shift_start_time ?? "—"} - {route.shift_end_time ?? "—"}</strong>
  </p>

  <p style={mutedTextStyle}>
    Break: <strong>{route.break_minutes ?? 0} min</strong>
  </p>
</div>

<div
  style={{
    ...ui.card.base,
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
  }}
>
  <h2 style={ui.page.sectionTitle}>Pace Intelligence</h2>

  <p style={mutedTextStyle}>
    Tempo utile turno:{" "}
    <strong>
      {availableShiftMinutes !== null
        ? `${Math.floor(availableShiftMinutes / 60)}h ${availableShiftMinutes % 60}m`
        : "Non impostato"}
    </strong>
  </p>

  <p style={mutedTextStyle}>
    Stop validi da gestire: <strong>{validStops}</strong>
  </p>

  <p style={mutedTextStyle}>
    Ritmo richiesto:{" "}
    <strong>
      {requiredStopsPerHour !== null
        ? `${requiredStopsPerHour} stop/ora`
        : "Imposta inizio e fine turno"}
    </strong>
  </p>

  <p style={mutedTextStyle}>
    Stato operativo:{" "}
    <strong>
      {requiredStopsPerHour === null
        ? "Profilo turno incompleto"
        : requiredStopsPerHour <= 18
          ? "Comodo"
          : requiredStopsPerHour <= 24
            ? "Impegnativo"
            : "Critico"}
    </strong>
  </p>
</div>

      <div style={pageGridStyle}>
        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Stop totali</p>
          <h2 style={kpiValueStyle}>{totalStops}</h2>
          <p style={kpiHintStyle}>Stop importati nella rotta.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Da geocodificare</p>
          <h2 style={kpiValueStyle}>{rawStops}</h2>
          <p style={kpiHintStyle}>Stop ancora da trasformare in coordinate.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Validi</p>
          <h2 style={kpiValueStyle}>{validStops}</h2>
          <p style={kpiHintStyle}>Stop pronti per ottimizzazione e guida.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Da rivedere</p>
          <h2 style={kpiValueStyle}>{needsReviewCount}</h2>
          <p style={kpiHintStyle}>Stop che richiedono controllo manuale.</p>
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
                <div style={stopCardHeaderStyle}>
                  <div style={stopNumberGroupStyle}>
                    <span style={amazonStopBadgeStyle}>
                      STOP #{stop.original_position}
                    </span>

                    <span style={optimizedStopBadgeStyle}>
                      OPT #{stop.position}
                    </span>
                  </div>

                  <span style={getStatusBadgeStyle(stop.status)}>
  {stop.status}
</span>
                </div>

                <div style={stopAddressStyle}>{stop.address}</div>

                <div style={stopMetaGridStyle}>
                  <div style={stopMetaItemStyle}>Fonte: {stop.source}</div>

                  {stop.lat && stop.lng ? (
                    <div style={stopMetaItemStyle}>
                      Coordinate: {stop.lat}, {stop.lng}
                    </div>
                  ) : (
                    <div style={stopMetaItemStyle}>
                      Coordinate: non disponibili
                    </div>
                  )}
                </div>

                <div style={stopEditPanelStyle}>
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

                    <div style={stopActionsStyle}>
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
                </div>
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