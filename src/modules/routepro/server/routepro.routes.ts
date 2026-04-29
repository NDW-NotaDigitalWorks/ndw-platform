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
    console.error("RoutePro route detail fetch error:", routeError.message);
    return null;
  }

  if (!route) {
    return null;
  }

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
      ...route,
      stops: [],
    };
  }

  return {
    ...route,
    stops: stops ?? [],
  };
}