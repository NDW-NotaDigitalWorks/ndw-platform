import { createClient } from "@/lib/supabase/server";

export type RouteProRouteStatus = "draft" | "in_progress" | "completed";

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