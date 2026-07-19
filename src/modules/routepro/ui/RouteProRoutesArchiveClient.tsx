"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NdwStatusPill } from "@/components/ndw";
import type {
  RouteProRouteStatus,
  RouteProRouteSummary,
} from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type RouteFilter = "all" | RouteProRouteStatus;
type RouteSort = "recent" | "oldest" | "name";

const controlsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1fr) repeat(2, minmax(160px, 220px))",
  gap: 12,
  marginTop: 24,
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 14,
  border: `1px solid ${ndwTokens.colors.border}`,
  background: ndwTokens.colors.surface,
  color: ndwTokens.colors.textPrimary,
  fontSize: 15,
  fontWeight: 700,
  outline: "none",
};

const resultBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 20,
  padding: "14px 16px",
  borderRadius: 16,
  border: `1px solid ${ndwTokens.colors.border}`,
  background: ndwTokens.colors.surfaceSoft,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  marginTop: 18,
};

const cardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: ndwTokens.radius["2xl"],
  border: `1px solid ${ndwTokens.colors.border}`,
  background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
  boxShadow: ndwTokens.shadows.sm,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 15,
};

const metaBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(148,163,184,0.08)",
  color: ndwTokens.colors.textSecondary,
  fontSize: 12,
  fontWeight: 850,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const emptyStyle: React.CSSProperties = {
  marginTop: 22,
  padding: 28,
  borderRadius: 20,
  border: `1px solid ${ndwTokens.colors.border}`,
  background: ndwTokens.colors.surfaceSoft,
  textAlign: "center",
};

function getStatusVariant(status: RouteProRouteStatus) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "info";
  return "warning";
}

function getStatusLabel(status: RouteProRouteStatus): string {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Draft";
}

function formatRouteProfile(profile: string | null): string {
  const normalizedProfile = profile ?? "generic";

  const profileLabels: Record<string, string> = {
    generic: "Generic",
    courier: "Courier",
    amazon_flex: "Amazon Flex",
    technician: "Technician",
    sales: "Sales",
    dhl: "DHL",
    ups: "UPS",
    generic_courier: "Generic courier",
    owner_driver: "Independent driver",
  };

  return (
    profileLabels[normalizedProfile] ??
    normalizedProfile
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getRouteDescription(route: RouteProRouteSummary): string {
  if (route.status === "completed") {
    return "Delivery session completed.";
  }

  if (route.status === "in_progress") {
    return "Driving session in progress.";
  }

  if (route.is_optimized) {
    return "Route optimized and ready to drive.";
  }

  return "Route preparation in progress.";
}

export function RouteProRoutesArchiveClient({
  routes,
}: {
  routes: RouteProRouteSummary[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RouteFilter>("all");
  const [sortOrder, setSortOrder] = useState<RouteSort>("recent");

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchingRoutes = routes.filter((route) => {
      const matchesStatus =
        statusFilter === "all" || route.status === statusFilter;

      const searchableText = [
        route.name,
        route.route_date,
        route.route_profile ?? "",
        route.status,
        route.start_address ?? "",
        route.return_address ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });

    return [...matchingRoutes].sort((firstRoute, secondRoute) => {
      if (sortOrder === "name") {
        return firstRoute.name.localeCompare(secondRoute.name, "it");
      }

      const firstDate = new Date(
        `${firstRoute.route_date}T00:00:00`,
      ).getTime();

      const secondDate = new Date(
        `${secondRoute.route_date}T00:00:00`,
      ).getTime();

      if (sortOrder === "oldest") {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    });
  }, [query, routes, sortOrder, statusFilter]);

  return (
    <>
      <div style={controlsStyle}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by route, date, profile or address..."
          aria-label="Search routes"
          style={controlStyle}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as RouteFilter)
          }
          aria-label="Filter routes by status"
          style={controlStyle}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as RouteSort)
          }
          aria-label="Sort routes"
          style={controlStyle}
        >
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Route name</option>
        </select>
      </div>

      <div style={resultBarStyle}>
        <strong style={{ color: ndwTokens.colors.textPrimary }}>
          {filteredRoutes.length} routes
        </strong>

        {(query || statusFilter !== "all" || sortOrder !== "recent") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setSortOrder("recent");
            }}
            style={{
              border: 0,
              padding: 0,
              background: "transparent",
              color: "#60a5fa",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      {filteredRoutes.length === 0 ? (
        <div style={emptyStyle}>
          <h2
            style={{
              margin: 0,
              color: ndwTokens.colors.textPrimary,
              fontSize: 24,
            }}
          >
            No routes found
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              color: ndwTokens.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Change your search or filters to display other routes.
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredRoutes.map((route) => (
            <article key={route.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      color: ndwTokens.colors.textPrimary,
                      fontSize: 21,
                      lineHeight: 1.2,
                      fontWeight: 950,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {route.name}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: ndwTokens.colors.textSecondary,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(route.route_date)}
                  </p>
                </div>

                <NdwStatusPill
                  label={getStatusLabel(route.status)}
                  variant={getStatusVariant(route.status)}
                />
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  color: ndwTokens.colors.textSecondary,
                  lineHeight: 1.5,
                  fontWeight: 650,
                }}
              >
                {getRouteDescription(route)}
              </p>

              <div style={metaRowStyle}>
                <span style={metaBadgeStyle}>
                  {formatRouteProfile(route.route_profile)}
                </span>

                {route.shift_start_time || route.shift_end_time ? (
                  <span style={metaBadgeStyle}>
                    {route.shift_start_time?.slice(0, 5) ?? "—"} →{" "}
                    {route.shift_end_time?.slice(0, 5) ?? "—"}
                  </span>
                ) : null}

                {route.is_optimized ? (
                  <span style={metaBadgeStyle}>Optimized</span>
                ) : null}
              </div>

              <div style={actionsStyle}>
                {route.status === "completed" ? (
                  <Link
                    href={`/app/routepro/routes/${route.id}/summary`}
                    style={routeProUi.primaryButton}
                  >
                    View Summary
                  </Link>
                ) : (
                  <Link
                    href={`/app/routepro/routes/${route.id}/review`}
                    style={routeProUi.primaryButton}
                  >
                    Continue Workflow
                  </Link>
                )}

                {route.status === "in_progress" ? (
                  <Link
                    href={`/app/routepro/${route.id}/execute`}
                    style={routeProUi.secondaryButton}
                  >
                    Resume Drive
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}