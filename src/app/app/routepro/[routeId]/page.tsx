import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addBulkRouteProStops,
  addManualRouteProStop,
  geocodeRouteProStops,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    geocoded?: string;
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
  if (error === "missing-address") {
    return "Inserisci un indirizzo prima di aggiungere lo stop.";
  }

  if (error === "add-stop-failed") {
    return "Non siamo riusciti ad aggiungere lo stop. Riprova.";
  }

  if (error === "geocode-failed") {
    return "Non siamo riusciti a geocodificare gli stop. Riprova.";
  }

  return null;
}

export default async function RouteProRoutePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const geocoded = resolvedSearchParams?.geocoded;

  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

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
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {geocoded === "1" ? (
        <div style={successStyle}>
          Geocoding completato. Controlla eventuali stop da rivedere.
        </div>
      ) : null}

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Aggiungi stop manuale</h2>

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

          <div style={actionsStyle}>
            <button type="submit" style={ui.button.primary}>
              Aggiungi stop
            </button>
          </div>
        </form>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Incolla lista indirizzi</h2>

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
              style={{
                ...ui.form.input,
                resize: "vertical",
              }}
            />
          </label>

          <div style={actionsStyle}>
            <button type="submit" style={ui.button.primary}>
              Importa lista
            </button>
          </div>
        </form>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Geocoding</h2>
        <p style={mutedTextStyle}>
          Trasforma gli indirizzi importati in coordinate. Gli stop riconosciuti
          diventeranno validi, quelli non trovati passeranno in revisione.
        </p>

        <form action={geocodeRouteProStops} style={{ marginTop: 16 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <button type="submit" style={ui.button.primary}>
            Geocodifica stop
          </button>
        </form>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Stop importati</h2>

        {route.stops.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              Nessuno stop inserito. Aggiungi il primo indirizzo manualmente.
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
                    #{stop.position} · {stop.address}
                  </strong>
                  <span style={badgeStyle}>{stop.status}</span>
                </div>

                <p style={mutedTextStyle}>Fonte: {stop.source}</p>

                {stop.lat && stop.lng ? (
                  <p style={mutedTextStyle}>
                    Coordinate: {stop.lat}, {stop.lng}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}