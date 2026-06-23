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

function getRouteStatusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "active" || status === "in_progress") return "info";
  if (status === "archived") return "neutral";
  return "warning";
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

  return (
    <section style={routeProUi.shell}>
      <RouteProHeader />

      <RouteProWorkflowHeader
        steps={[
          { label: "Import", status: "current" },
          { label: "Review", status: "pending" },
          { label: "Verify", status: "pending" },
          { label: "Optimize", status: "pending" },
          { label: "Drive", status: "pending" },
          { label: "Summary", status: "pending" },
        ]}
      />

      <div style={routeProUi.hero}>
        <h1 style={routeProUi.heroTitle}>RoutePro Command Center</h1>

        <p style={routeProUi.heroSubtitle}>
          Import your stops, review your route, verify addresses, optimize the sequence
          and drive smarter with a workflow built for real multi-stop drivers.
        </p>

        <div style={actionsStyle}>
          <Link href="/app/routepro/import-ai" style={routeProUi.primaryButton}>
  AI Screenshot Import
</Link>

          <Link href="/app/routepro/settings" style={routeProUi.secondaryButton}>
            Driver settings
          </Link>
        </div>
      </div>

      <div style={gridStyle}>
        <NdwMetricCard label="Routes prepared" value={totalRoutes} />
        <NdwMetricCard label="Active workflows" value={activeRoutes} />
        <NdwMetricCard label="Completed days" value={completedRoutes} />
      </div>

      <section style={analyticsPanelStyle}>
        <p style={analyticsTitleStyle}>Dashboard Analytics</p>

        <div style={analyticsGridStyle}>
          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Completion rate</p>
            <p style={analyticsValueStyle}>{completionRate}%</p>
            <p style={analyticsHintStyle}>Completed routes over total prepared routes.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Optimized routes</p>
            <p style={analyticsValueStyle}>{optimizedRoutes}</p>
            <p style={analyticsHintStyle}>Routes already optimized and ready to drive.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Tracked sessions</p>
            <p style={analyticsValueStyle}>{trackedSessions}</p>
            <p style={analyticsHintStyle}>Routes with real driving session timestamps.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Avg duration</p>
            <p style={analyticsValueStyle}>{formatDuration(averageDurationMinutes)}</p>
            <p style={analyticsHintStyle}>Average real duration of completed tracked routes.</p>
          </article>

          <article style={analyticsCardStyle}>
  <p style={analyticsLabelStyle}>Routes completed</p>
  <p style={analyticsValueStyle}>
    {history.routesCompleted}
  </p>
  <p style={analyticsHintStyle}>
    Total completed delivery days.
  </p>
</article>

<article style={analyticsCardStyle}>
  <p style={analyticsLabelStyle}>Stops managed</p>
  <p style={analyticsValueStyle}>
    {history.stopsManaged}
  </p>
  <p style={analyticsHintStyle}>
    Total imported stops.
  </p>
</article>

<article style={analyticsCardStyle}>
  <p style={analyticsLabelStyle}>Avg stops / route</p>
  <p style={analyticsValueStyle}>
    {history.avgStopsPerRoute}
  </p>
  <p style={analyticsHintStyle}>
    Average route size.
  </p>
</article>

<article style={analyticsCardStyle}>
  <p style={analyticsLabelStyle}>Best day</p>
  <p style={analyticsValueStyle}>
    {history.bestDayStops}
  </p>
  <p style={analyticsHintStyle}>
    Highest stop count completed.
  </p>
</article>
        </div>
      </section>

      <div style={{ marginTop: ndwTokens.spacing["3xl"] }}>
        <NdwSectionHeader
          eyebrow="RoutePro"
          title="Your delivery days"
          subtitle="Open a route workflow, continue preparation or start driving."
        />

        {routes.length === 0 ? (
          <NdwEmptyState
            eyebrow="Nessuna rotta"
            title="No delivery day prepared yet"
            description="Create your first route, import stops, review addresses, optimize the sequence and start driving."
            action={
              <Link href="/app/routepro/import-ai" style={routeProUi.primaryButton}>
  Import first route with AI
</Link>
            }
          />
        ) : (
          <div style={gridStyle}>
            {routes.map((route) => {
              const durationMinutes = getMinutesBetween(route.started_at, route.completed_at);

              return (
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
                      ? "Route optimized and ready to drive"
                      : "Route preparation in progress"}
                  </p>

                  <div style={routeMetaGridStyle}>
                    <div style={routeMetaItemStyle}>
                      <p style={routeMetaLabelStyle}>Session</p>
                      <p style={routeMetaValueStyle}>
                        {getRouteSessionLabel(route.status, route.started_at, route.completed_at)}
                      </p>
                    </div>

                    <div style={routeMetaItemStyle}>
                      <p style={routeMetaLabelStyle}>Duration</p>
                      <p style={routeMetaValueStyle}>{formatDuration(durationMinutes)}</p>
                    </div>

                    <div style={routeMetaItemStyle}>
                      <p style={routeMetaLabelStyle}>Profile</p>
                      <p style={routeMetaValueStyle}>{route.route_profile ?? "generic"}</p>
                    </div>
                  </div>

                  <div style={actionsStyle}>
                    <Link href={`/app/routepro/${route.id}`} style={routeProUi.primaryButton}>
                      Open workflow
                    </Link>

                    <Link
                      href={`/app/routepro/${route.id}/execute`}
                      style={routeProUi.secondaryButton}
                    >
                      Drive route
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
