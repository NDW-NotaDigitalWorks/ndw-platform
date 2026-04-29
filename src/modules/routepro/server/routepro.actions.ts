"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function addManualRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!routeId) {
    redirect("/app/routepro");
  }

  if (!address) {
    redirect(`/app/routepro/${routeId}?error=missing-address`);
  }

  const { count, error: countError } = await supabase
    .from("routepro_stops")
    .select("id", { count: "exact", head: true })
    .eq("route_id", routeId);

  if (countError) {
    console.error("RoutePro stop count error:", countError.message);
    redirect(`/app/routepro/${routeId}?error=add-stop-failed`);
  }

  const nextPosition = (count ?? 0) + 1;

  const { error } = await supabase.from("routepro_stops").insert({
    route_id: routeId,
    position: nextPosition,
    original_position: nextPosition,
    raw_text: address,
    address,
    status: "raw",
    source: "manual",
  });

  if (error) {
    console.error("RoutePro add manual stop error:", error.message);
    redirect(`/app/routepro/${routeId}?error=add-stop-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}`);
}