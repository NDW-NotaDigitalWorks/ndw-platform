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
import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    optimized?: string;
    error?: string;
  }>;
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 22,
};

const cardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 16,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
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

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf5",
  color: "#047857",
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 700,
};

function getOptimizationError(error?: string): string | null {
  if (error === "optimize-failed") {
    return "Route optimization failed. Check valid stops and try again.";
  }

  if (error === "optimize-needs-review") {
    return "Some stops still need review before optimization.";
  }

  if (error === "optimize-not-enough-stops") {
    return "At least 2 valid stops are required to optimize a route.";
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

  const totalStops = route.stops.length;
  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const needsReviewStops = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;
  const rawStops = route.stops.filter((stop) => stop.status === "raw").length;

  const optimizedStops = [...route.stops].sort(
    (a, b) => a.position - b.position,
  );

  const deliveryClusters = buildDeliveryClusters(optimizedStops);
  const multiStopClusters = getMultiStopDeliveryClusters(optimizedStops);
  const errorMessage = getOptimizationError(resolvedSearchParams?.error);

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Optimize"
      title="Optimize route"
      subtitle="Prepare the best sequence while preserving every original stop number."
    >
      {resolvedSearchParams?.optimized === "1" ? (
        <div style={successStyle}>
          Route optimized. Workflow positions have been updated while original stop
          numbers were preserved.
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <div style={gridStyle}>
        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Total stops</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{totalStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Delivery clusters</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {multiStopClusters.length}
          </h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Valid stops</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{validStops}</h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Need review</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            {needsReviewStops}
          </h2>
        </article>

        <article style={cardStyle}>
          <p style={ui.page.eyebrow}>Waiting verification</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>{rawStops}</h2>
        </article>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Optimization</h2>
        <p style={mutedTextStyle}>
          RoutePro optimizes the workflow order but never removes stops and never
          loses the original stop number.
        </p>

        <form action={optimizeRouteProRoute} style={{ marginTop: 18 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <RouteProSubmitButton
            idleLabel={route.is_optimized ? "Re-optimize route" : "Optimize route"}
            pendingLabel="Optimizing route..."
          />
        </form>

        {route.is_optimized ? (
          <p style={mutedTextStyle}>
            Last optimization: {route.optimized_at ?? "completed"}
          </p>
        ) : null}
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Delivery clusters</h2>
        <p style={mutedTextStyle}>
          RoutePro groups repeated addresses without deleting stops or losing
          original stop numbers.
        </p>

        {multiStopClusters.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              No repeated delivery addresses detected in this route.
            </p>
          </div>
        ) : (
          <div style={listStyle}>
            {multiStopClusters.map((cluster) => (
              <article key={cluster.normalizedAddress} style={cardStyle}>
                <p style={ui.page.eyebrow}>
                  Workflow stop {cluster.workflowPosition}
                </p>

                <h3 style={{ margin: "8px 0 0" }}>{cluster.address}</h3>

                <p style={mutedTextStyle}>
                  Original stops:{" "}
                  <strong>
                    {cluster.stops
                      .map((stop) => stop.original_position)
                      .sort((a, b) => a - b)
                      .join(" • ")}
                  </strong>
                </p>

                <p style={mutedTextStyle}>
                  Packages/stops at this address:{" "}
                  <strong>{cluster.stops.length}</strong>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>Optimized workflow preview</h2>

        {deliveryClusters.length === 0 ? (
          <div style={{ ...ui.card.base, marginTop: 18 }}>
            <p style={mutedTextStyle}>
              No stops available yet. Import and verify stops before optimizing.
            </p>
          </div>
        ) : (
          <div style={listStyle}>
            {deliveryClusters.map((cluster) => (
              <article key={cluster.normalizedAddress} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <strong>
                      Workflow stop {cluster.workflowPosition}
                      {cluster.stops.length > 1
                        ? ` · ${cluster.stops.length} original stops`
                        : ` · Original stop ${cluster.stops[0]?.original_position}`}
                    </strong>

                    <p style={mutedTextStyle}>{cluster.address}</p>

                    <p style={mutedTextStyle}>
                      Original stops:{" "}
                      <strong>
                        {cluster.stops
                          .map((stop) => stop.original_position)
                          .sort((a, b) => a - b)
                          .join(" • ")}
                      </strong>
                    </p>
                  </div>

                  <span style={badgeStyle}>
                    {cluster.stops.length > 1 ? "cluster" : cluster.stops[0]?.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        <Link
          href={`/app/routepro/routes/${route.id}/drive`}
          style={routeProUi.primaryButton}
        >
          Continue to drive
        </Link>

        <Link
          href={`/app/routepro/routes/${route.id}/verify`}
          style={routeProUi.secondaryButton}
        >
          Back to verify
        </Link>

        <Link href={`/app/routepro/${route.id}`} style={routeProUi.secondaryButton}>
          Classic route view
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}