"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getDefaultRouteName(routeDate: string): string {
  return `Route ${routeDate}`;
}

export async function createRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const routeDate = String(formData.get("route_date") ?? "").trim();
  const startAddress = String(formData.get("start_address") ?? "").trim();

  if (!routeDate) {
    redirect("/app/routepro/new?error=missing-date");
  }

  const name = rawName || getDefaultRouteName(routeDate);

  const { data, error } = await supabase
    .from("routepro_routes")
    .insert({
      user_id: user.id,
      name,
      route_date: routeDate,
      start_address: startAddress || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("RoutePro create route error:", error?.message);
    redirect("/app/routepro/new?error=create-failed");
  }

  redirect("/app/routepro");
}