import { createClient } from "@/lib/supabase/server";

export type RouteProRouteStatus = "draft" | "in_progress" | "completed";
export type RouteProStopStatus =
  | "raw"
  | "needs_review"
  | "valid"
  | "completed"
  | "skipped";

export type RouteProStopSource = "manual" | "paste" | "csv" | "screenshot";

export type RouteProRouteSummary = {
  id: string;
  user_id: string;
  name: string;
  route_date: string;
  start_address: string | null;
  start_lat: number | null;
  start_lng: number | null;
  return_address: string | null;
  return_lat: number | null;
  return_lng: number | null;
  shift_start_time: string | null;
  shift_end_time: string | null;
  break_minutes: number | null;
  route_profile: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  completed_at: string | null;
  status: RouteProRouteStatus;
  is_optimized: boolean;
  optimized_at: string | null;
  optimization_method: string | null;
  created_at: string;
  updated_at: string;
};

export type RouteProStopSummary = {
  id: string;
  route_id: string;
  position: number;
  original_position: number;
  raw_text: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  status: RouteProStopStatus;
  source: RouteProStopSource;
  created_at: string;
  updated_at: string;
};

export type RouteProRouteDetail = RouteProRouteSummary & {
  stops: RouteProStopSummary[];
};

function withSessionFallback<T extends Omit<RouteProRouteSummary, "started_at" | "last_activity_at" | "completed_at">>(
  route: T,
): T & Pick<RouteProRouteSummary, "started_at" | "last_activity_at" | "completed_at"> {
  return {
    ...route,
    started_at: null,
    last_activity_at: null,
    completed_at: null,
  };
}

export async function getMyRouteProRoutes(): Promise<RouteProRouteSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routepro_routes")
    .select(
      `
      id,
      user_id,
      name,
      route_date,
      start_address,
      start_lat,
      start_lng,
      return_address,
      return_lat,
      return_lng,
      shift_start_time,
      shift_end_time,
      break_minutes,
      route_profile,
      started_at,
      last_activity_at,
      completed_at,
      status,
      is_optimized,
      optimized_at,
      optimization_method,
      created_at,
      updated_at
    `,
    )
    .order("route_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("RoutePro routes fetch error:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getMyRouteProRouteDetail(
  routeId: string,
): Promise<RouteProRouteDetail | null> {
  const supabase = await createClient();

  const { data: route, error: routeError } = await supabase
    .from("routepro_routes")
    .select(
      `
      id,
      user_id,
      name,
      route_date,
      start_address,
      start_lat,
      start_lng,
      return_address,
      return_lat,
      return_lng,
      shift_start_time,
      shift_end_time,
      break_minutes,
      route_profile,
      started_at,
      last_activity_at,
      completed_at,
      status,
      is_optimized,
      optimized_at,
      optimization_method,
      created_at,
      updated_at
    `,
    )
    .eq("id", routeId)
    .maybeSingle();

  if (routeError) {
  console.error(
    "RoutePro route detail fetch error:",
    JSON.stringify(routeError, null, 2),
  );
  return null;
}

  if (!route) {
    return null;
  }

  const routeWithSessionFallback = withSessionFallback(route);

  const { data: stops, error: stopsError } = await supabase
    .from("routepro_stops")
    .select(
      `
      id,
      route_id,
      position,
      original_position,
      raw_text,
      address,
      lat,
      lng,
      status,
      source,
      created_at,
      updated_at
    `,
    )
    .eq("route_id", routeId)
    .order("position", { ascending: true });

  if (stopsError) {
    console.error("RoutePro stops fetch error:", stopsError.message);
    return {
      ...routeWithSessionFallback,
      stops: [],
    };
  }

  return {
    ...routeWithSessionFallback,
    stops: stops ?? [],
  };
}

export async function getRouteProHistoryStats() {
  const supabase = await createClient();

  const { data: routes } = await supabase
    .from("routepro_routes")
    .select(`
      id,
      status,
      started_at,
      completed_at
    `);

  const { data: stops } = await supabase
    .from("routepro_stops")
    .select(`
      route_id,
      status
    `);

  const completedRoutes =
    routes?.filter((route) => route.status === "completed") ?? [];

  const totalStops = stops?.length ?? 0;

  const stopsPerRoute = new Map<string, number>();

  (stops ?? []).forEach((stop) => {
    stopsPerRoute.set(
      stop.route_id,
      (stopsPerRoute.get(stop.route_id) ?? 0) + 1,
    );
  });

  const bestDay = completedRoutes.reduce(
    (best, route) => {
      const count = stopsPerRoute.get(route.id) ?? 0;

      if (count > best.stopCount) {
        return {
          routeName: route.id,
          stopCount: count,
        };
      }

      return best;
    },
    {
      routeName: "",
      stopCount: 0,
    },
  );

  const avgStopsPerRoute =
    completedRoutes.length > 0
      ? Math.round(
          totalStops /
            Math.max(1, completedRoutes.length),
        )
      : 0;

  return {
    routesCompleted: completedRoutes.length,
    stopsManaged: totalStops,
    avgStopsPerRoute,
    bestDayStops: bestDay.stopCount,
  };
}