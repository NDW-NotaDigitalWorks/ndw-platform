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
          <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
            Prepare new route
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
              <Link href="/app/routepro/new" style={routeProUi.primaryButton}>
                Prepare first route
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
  ? "Route optimized and ready to drive"
  : "Route preparation in progress"}
                </p>

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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}