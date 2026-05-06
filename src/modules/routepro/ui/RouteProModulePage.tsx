import Link from "next/link";
import { getRouteProDictionary } from "@/modules/routepro/i18n";
import { getMyRouteProRoutes } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 24,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
};

const routeCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
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

export default async function RouteProModulePage() {
  const t = getRouteProDictionary("it");
  const routes = await getMyRouteProRoutes();

  const totalRoutes = routes.length;
  const completedRoutes = routes.filter((route) => route.status === "completed").length;
  const activeRoutes = routes.filter((route) => route.status !== "completed").length;

  return (
    <section style={routeProUi.shell}>
      <RouteProHeader />

      <div style={routeProUi.hero}>
        <h1 style={routeProUi.heroTitle}>{t.title}</h1>
        <p style={routeProUi.heroSubtitle}>
          Importa screenshot, liste o CSV. Geocodifica, ottimizza e completa la
          rotta con una modalità execution pensata per driver reali.
        </p>

        <div style={actionsStyle}>
          <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
            Nuova rotta
          </Link>

          <Link href="/app/routepro/settings" style={routeProUi.secondaryButton}>
            Impostazioni API
          </Link>
        </div>
      </div>

      <div style={gridStyle}>
        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Rotte totali</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalRoutes}</h2>
        </article>

        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Attive</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{activeRoutes}</h2>
        </article>

        <article style={ui.card.base}>
          <p style={ui.page.eyebrow}>Completate</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{completedRoutes}</h2>
        </article>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>Le tue rotte</h2>

        {routes.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>Nessuna rotta creata</h3>
            <p style={mutedTextStyle}>
              Crea la tua prima rotta, importa gli stop, geocodifica, ottimizza
              e avvia la modalità execution.
            </p>

            <div style={actionsStyle}>
              <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
                Crea prima rotta
              </Link>
            </div>
          </div>
        ) : (
          <div style={gridStyle}>
            {routes.map((route) => (
              <article key={route.id} style={ui.card.base}>
                <div style={routeCardHeaderStyle}>
                  <div>
                    <h3 style={{ margin: 0 }}>{route.name}</h3>
                    <p style={mutedTextStyle}>Data: {route.route_date}</p>
                  </div>

                  <span style={badgeStyle}>{route.status}</span>
                </div>

                <p style={mutedTextStyle}>
                  {route.is_optimized
                    ? "Rotta ottimizzata"
                    : "Rotta non ancora ottimizzata"}
                </p>

                <div style={actionsStyle}>
                  <Link href={`/app/routepro/${route.id}`} style={routeProUi.primaryButton}>
                    Apri rotta
                  </Link>

                  <Link
                    href={`/app/routepro/${route.id}/execute`}
                    style={routeProUi.secondaryButton}
                  >
                    Avvia percorso
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}