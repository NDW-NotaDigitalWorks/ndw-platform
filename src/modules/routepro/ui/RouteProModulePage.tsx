import Link from "next/link";
import {
  NdwEmptyState,
  NdwMetricCard,
  NdwSectionHeader,
  NdwStatusPill,
} from "@/components/ndw";
import { getRouteProDictionary } from "@/modules/routepro/i18n";
import {
  getMyRouteProRoutes,
  getRouteProHistoryStats,
} from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { RouteProWorkflowHeader } from "@/modules/routepro/v2/ui/RouteProWorkflowHeader";
import { RouteProAnalyticsPanel } from "@/modules/routepro/ui/RouteProAnalyticsPanel";
import { getDriverHeroState } from "@/modules/routepro/ui/driver-hero";

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

const heroResumeCardStyle: React.CSSProperties = {
  marginTop: 22,
  padding: 18,
  borderRadius: 24,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const heroResumeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const heroResumeLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const heroResumeValueStyle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: 16,
  fontWeight: 950,
  color: "#ffffff",
};

const routeCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: ndwTokens.spacing.md,
  alignItems: "flex-start",
};

const analyticsPanelStyle: React.CSSProperties = {
  marginTop: ndwTokens.spacing["3xl"],
  padding: ndwTokens.spacing.xl,
  borderRadius: ndwTokens.radius["2xl"],
  border: "1px solid rgba(147,197,253,0.28)",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
};

const analyticsTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#93c5fd",
};

const analyticsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: ndwTokens.spacing.md,
  marginTop: ndwTokens.spacing.lg,
};

const analyticsCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const analyticsLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const analyticsValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const analyticsHintStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 700,
  color: "rgba(255,255,255,0.68)",
};

const routeMetaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginTop: 16,
};

const routeMetaItemStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(15,23,42,0.04)",
  border: `1px solid ${ndwTokens.colors.border}`,
};

const routeMetaLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: ndwTokens.colors.textSecondary,
};

const routeMetaValueStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 16,
  fontWeight: ndwTokens.typography.weights.black,
  color: ndwTokens.colors.textPrimary,
};

const compactRouteGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: ndwTokens.spacing.lg,
  marginTop: ndwTokens.spacing.xl,
};

const compactRouteCardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: ndwTokens.radius["2xl"],
  border: `1px solid ${ndwTokens.colors.border}`,
  background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
  boxShadow: ndwTokens.shadows.sm,
};

const compactMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const compactMetaBadgeStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: ndwTokens.colors.textSecondary,
  fontSize: 12,
  fontWeight: 800,
};

const routeActionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

function getRouteStatusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "active" || status === "in_progress") return "info";
  if (status === "archived") return "neutral";
  return "warning";
}
function formatRouteProfile(profile: string | null): string {
  const normalizedProfile = profile ?? "generic";

  const profileLabels: Record<string, string> = {
    generic: "Generico",
    courier: "Corriere",
    amazon_flex: "Amazon Flex",
    technician: "Tecnico",
    sales: "Commerciale",
    dhl: "DHL",
    ups: "UPS",
    generic_courier: "Corriere generico",
    owner_driver: "Driver indipendente",
  };

  return (
    profileLabels[normalizedProfile] ??
    normalizedProfile
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function getMinutesBetween(startedAt: string | null, completedAt: string | null): number | null {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return Math.max(1, Math.round((end - start) / 60000));
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
}

function getRouteSessionLabel(
  status: string,
  startedAt: string | null,
  completedAt: string | null,
): string {
  if (status === "completed" || completedAt) return "Completed";
  if (status === "in_progress" || startedAt) return "In progress";
  return "Not started";
}

function getAverageDurationMinutes(
  routes: Array<{ started_at: string | null; completed_at: string | null }>,
): number | null {
  const durations = routes
    .map((route) => getMinutesBetween(route.started_at, route.completed_at))
    .filter((duration): duration is number => duration !== null);

  if (durations.length === 0) return null;

  return Math.round(
    durations.reduce((total, duration) => total + duration, 0) / durations.length,
  );
}

export default async function RouteProModulePage() {
  const t = getRouteProDictionary("it");
  const routes = await getMyRouteProRoutes();
  const history = await getRouteProHistoryStats();

  const totalRoutes = routes.length;
  const completedRoutes = routes.filter((route) => route.status === "completed").length;
  const activeRoutes = routes.filter((route) => route.status !== "completed").length;
  const optimizedRoutes = routes.filter((route) => route.is_optimized).length;
  const trackedSessions = routes.filter(
  (route) => Boolean(route.started_at || route.last_activity_at || route.completed_at),
).length;
  const averageDurationMinutes = getAverageDurationMinutes(routes);
  const completionRate =
    totalRoutes > 0 ? Math.round((completedRoutes / totalRoutes) * 100) : 0;
    const routeToResume =
  routes.find((route) => route.status === "in_progress") ??
  routes.find((route) => route.status !== "completed") ??
  null;
  const recentRoutes = routes.slice(0, 4);

const lastCompletedRoute =
  routes.find((route) => route.status === "completed") ?? null;

const hero = getDriverHeroState(routeToResume);

  return (
    <section style={routeProUi.shell}>
      <RouteProHeader />

      <RouteProWorkflowHeader
  steps={[
    {
      label: "Import",
      status: routeToResume ? "current" : "pending",
    },
    { label: "Review", status: "pending" },
    { label: "Verify", status: "pending" },
    { label: "Optimize", status: "pending" },
    { label: "Drive", status: "pending" },
    { label: "Summary", status: "pending" },
  ]}
/>

      <div style={routeProUi.hero}>
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
    }}
  >
    <div>
      <h1 style={routeProUi.heroTitle}>
        {routeToResume ? "Centro operativo" : "Pronto per una nuova giornata"}
      </h1>

      <p style={routeProUi.heroSubtitle}>
        {hero.subtitle}
      </p>
    </div>

    <Link
      href="/app/routepro/settings"
      style={{
        ...routeProUi.secondaryButton,
        minHeight: 42,
        padding: "0 16px",
      }}
    >
      Impostazioni
    </Link>
  </div>

  {routeToResume ? (
    <div style={heroResumeCardStyle}>
      <p style={heroResumeLabelStyle}>{hero.badge}</p>

      <h2
        style={{
          margin: "8px 0 0",
          color: "#ffffff",
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 950,
        }}
      >
        {hero.title}
      </h2>

      <div style={heroResumeGridStyle}>
        <div>
          <p style={heroResumeLabelStyle}>Data</p>
          <p style={heroResumeValueStyle}>
            {routeToResume.route_date}
          </p>
        </div>

        <div>
          <p style={heroResumeLabelStyle}>Stato</p>
          <p style={heroResumeValueStyle}>
            {hero.stateLabel}
          </p>
        </div>

        <div>
          <p style={heroResumeLabelStyle}>Profilo</p>
          <p style={heroResumeValueStyle}>
            {formatRouteProfile(routeToResume.route_profile)}
          </p>
        </div>
      </div>

      <div style={actionsStyle}>
        <Link
          href={hero.primaryHref}
          style={routeProUi.primaryButton}
        >
          {hero.primaryLabel}
        </Link>

        {hero.secondaryHref && hero.secondaryLabel ? (
          <Link
            href={hero.secondaryHref}
            style={routeProUi.secondaryButton}
          >
            {hero.secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  ) : (
    <div style={heroResumeCardStyle}>
      <p style={heroResumeLabelStyle}>Nessun workflow attivo</p>

      <h2
        style={{
          margin: "8px 0 0",
          color: "#ffffff",
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 950,
        }}
      >
        Prepariamo la prossima giornata.
      </h2>

      <div style={heroResumeGridStyle}>
        <div>
          <p style={heroResumeLabelStyle}>Ultima rotta</p>
          <p style={heroResumeValueStyle}>
            {lastCompletedRoute?.name ?? "Nessuna"}
          </p>
        </div>

        <div>
          <p style={heroResumeLabelStyle}>Ultima attività</p>
          <p style={heroResumeValueStyle}>
            {lastCompletedRoute?.route_date ?? "—"}
          </p>
        </div>

        <div>
          <p style={heroResumeLabelStyle}>Stop gestiti</p>
          <p style={heroResumeValueStyle}>
            {history.stopsManaged}
          </p>
        </div>

        <div>
          <p style={heroResumeLabelStyle}>Rotte completate</p>
          <p style={heroResumeValueStyle}>
            {history.routesCompleted}
          </p>
        </div>
      </div>

      <div style={actionsStyle}>
        <Link
          href="/app/routepro/new"
          style={routeProUi.primaryButton}
        >
          Prepara nuova rotta
        </Link>

        <Link
          href="/app/routepro/routes"
          style={routeProUi.secondaryButton}
        >
          Storico rotte
        </Link>
      </div>
    </div>
  )}
</div>

      {/* Dashboard summary moved into Analytics */}

      <RouteProAnalyticsPanel
  completionRate={completionRate}
  optimizedRoutes={optimizedRoutes}
  trackedSessions={trackedSessions}
  averageDuration={formatDuration(averageDurationMinutes)}
  routesCompleted={history.routesCompleted}
  stopsManaged={history.stopsManaged}
  avgStopsPerRoute={history.avgStopsPerRoute}
  bestDayStops={history.bestDayStops}
/>

      <div style={{ marginTop: ndwTokens.spacing["3xl"] }}>
        <NdwSectionHeader
          eyebrow="RoutePro"
          title="Recent Routes"
          subtitle="Continue a workflow or review your latest delivery sessions."
        />

        {routes.length === 0 ? (
          <NdwEmptyState
            eyebrow="Nessuna rotta"
            title="No delivery day prepared yet"
            description="Create your first route, import stops, review addresses, optimize the sequence and start driving."
            action={
              <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
  Crea la prima rotta
</Link>
            }
          />
                ) : (
          <>
            <div style={compactRouteGridStyle}>
              {recentRoutes.map((route) => {
                const durationMinutes = getMinutesBetween(
                  route.started_at,
                  route.completed_at,
                );

                return (
                  <article
                    key={route.id}
                    style={compactRouteCardStyle}
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
                      {route.status === "completed"
                        ? "Delivery session completed"
                        : route.is_optimized
                          ? "Route optimized and ready to drive"
                          : "Route preparation in progress"}
                    </p>

                    <div style={compactMetaRowStyle}>
                      <span style={compactMetaBadgeStyle}>
                        {getRouteSessionLabel(
                          route.status,
                          route.started_at,
                          route.completed_at,
                        )}
                      </span>

                      <span style={compactMetaBadgeStyle}>
                        {formatDuration(durationMinutes)}
                      </span>

                      <span style={compactMetaBadgeStyle}>
                        {formatRouteProfile(route.route_profile)}
                      </span>
                    </div>

                    <div style={routeActionRowStyle}>
                      <Link
                        href={`/app/routepro/${route.id}`}
                        style={routeProUi.primaryButton}
                      >
                        {route.status === "completed"
                          ? "View Summary"
                          : "Continue Workflow"}
                      </Link>

                      {route.status !== "completed" ? (
                        <Link
                          href={`/app/routepro/${route.id}/execute`}
                          style={routeProUi.secondaryButton}
                        >
                          Resume Drive
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: ndwTokens.spacing.xl,
              }}
            >
              <Link
                href="/app/routepro/routes"
                style={routeProUi.secondaryButton}
              >
                Visualizza tutte le rotte →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}