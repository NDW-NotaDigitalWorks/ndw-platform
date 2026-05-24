import Link from "next/link";
import {
  NdwEmptyState,
  NdwMetricCard,
  NdwSectionHeader,
  NdwStatusPill,
} from "@/components/ndw";
import { getRouteProDictionary } from "@/modules/routepro/i18n";
import { getMyRouteProRoutes } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: ndwTokens.spacing.lg,
  marginTop: ndwTokens.spacing.xl,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: ndwTokens.spacing.md,
  marginTop: ndwTokens.spacing.xl,
};

const routeCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: ndwTokens.spacing.md,
  alignItems: "flex-start",
};

function getRouteStatusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "active") return "info";
  if (status === "archived") return "neutral";
  return "warning";
}

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
        <NdwMetricCard label="Rotte totali" value={totalRoutes} />
        <NdwMetricCard label="Attive" value={activeRoutes} />
        <NdwMetricCard label="Completate" value={completedRoutes} />
      </div>

      <div style={{ marginTop: ndwTokens.spacing["3xl"] }}>
        <NdwSectionHeader
          eyebrow="RoutePro"
          title="Le tue rotte"
          subtitle="Gestisci le rotte create, apri i dettagli o avvia la modalità percorso."
        />

        {routes.length === 0 ? (
          <NdwEmptyState
            eyebrow="Nessuna rotta"
            title="Nessuna rotta creata"
            description="Crea la tua prima rotta, importa gli stop, geocodifica, ottimizza e avvia la modalità execution."
            action={
              <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
                Crea prima rotta
              </Link>
            }
          />
        ) : (
          <div style={gridStyle}>
            {routes.map((route) => (
              <article
                key={route.id}
                style={{
                  padding: ndwTokens.spacing.xl,
                  borderRadius: ndwTokens.radius["2xl"],
                  border: `1px solid ${ndwTokens.colors.border}`,
                  background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
                  boxShadow: ndwTokens.shadows.sm,
                }}
              >
                <div style={routeCardHeaderStyle}>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: ndwTokens.colors.textPrimary,
                        fontSize: ndwTokens.typography.sizes.cardTitle,
                        fontWeight: ndwTokens.typography.weights.black,
                      }}
                    >
                      {route.name}
                    </h3>

                    <p
                      style={{
                        margin: "10px 0 0",
                        color: ndwTokens.colors.textSecondary,
                        fontSize: ndwTokens.typography.sizes.body,
                        lineHeight: ndwTokens.typography.lineHeights.normal,
                      }}
                    >
                      Data: {route.route_date}
                    </p>
                  </div>

                  <NdwStatusPill
                    label={route.status}
                    variant={getRouteStatusVariant(route.status)}
                  />
                </div>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: ndwTokens.colors.textSecondary,
                    fontSize: ndwTokens.typography.sizes.body,
                    lineHeight: ndwTokens.typography.lineHeights.normal,
                  }}
                >
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