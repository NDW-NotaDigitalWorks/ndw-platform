"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddressWithOpenRouteService } from "@/modules/routepro/server/routepro.geocoding";

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
export async function addBulkRouteProStops(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const rawText = String(formData.get("bulk_addresses") ?? "").trim();

  if (!routeId) {
    redirect("/app/routepro");
  }

  if (!rawText) {
    redirect(`/app/routepro/${routeId}?error=missing-address`);
  }

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    redirect(`/app/routepro/${routeId}?error=missing-address`);
  }

  const { count } = await supabase
    .from("routepro_stops")
    .select("id", { count: "exact", head: true })
    .eq("route_id", routeId);

  let nextPosition = (count ?? 0) + 1;

  const rows = lines.map((address) => {
    const row = {
      route_id: routeId,
      position: nextPosition,
      original_position: nextPosition,
      raw_text: address,
      address,
      status: "raw",
      source: "paste",
    };

    nextPosition += 1;
    return row;
  });

  const { error } = await supabase
    .from("routepro_stops")
    .insert(rows);

  if (error) {
    console.error("Bulk stop insert error:", error.message);
    redirect(`/app/routepro/${routeId}?error=add-stop-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}`);
}

export async function saveRouteProOpenRouteServiceKey(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const apiKey = String(formData.get("openrouteservice_key") ?? "").trim();

  if (!apiKey) {
    redirect("/app/routepro/settings?error=missing-key");
  }

  const { error } = await supabase.from("routepro_api_keys").upsert(
    {
      user_id: user.id,
      provider: "openrouteservice",
      encrypted_key: apiKey,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,provider",
    },
  );

  if (error) {
    console.error("RoutePro API key save error:", error.message);
    redirect("/app/routepro/settings?error=save-failed");
  }

  redirect("/app/routepro/settings?saved=1");
}

export async function geocodeRouteProStops(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();

  if (!routeId) {
    redirect("/app/routepro");
  }

  const { data: stops, error: stopsError } = await supabase
    .from("routepro_stops")
    .select("id, address")
    .eq("route_id", routeId)
    .in("status", ["raw", "needs_review"])
    .order("position", { ascending: true });

  if (stopsError) {
    console.error("RoutePro stops geocode fetch error:", stopsError.message);
    redirect(`/app/routepro/${routeId}?error=geocode-failed`);
  }

  if (!stops || stops.length === 0) {
    redirect(`/app/routepro/${routeId}?geocoded=0`);
  }

  for (const stop of stops) {
    const result = await geocodeAddressWithOpenRouteService(stop.address);

    if (result.ok) {
      await supabase
        .from("routepro_stops")
        .update({
          lat: result.lat,
          lng: result.lng,
          status: "valid",
          geocoding_provider: result.provider,
          geocoding_status: "success",
          geocoding_confidence: result.confidence,
          geocoding_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stop.id);
    } else {
      await supabase
        .from("routepro_stops")
        .update({
          status: "needs_review",
          geocoding_provider: result.provider,
          geocoding_status:
            result.reason === "missing_key" ? "missing_key" : "failed",
          geocoding_error: result.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stop.id);
    }
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?geocoded=1`);
}

export async function updateRouteProStopAddress(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!routeId) {
    redirect("/app/routepro");
  }

  if (!stopId || !address) {
    redirect(`/app/routepro/${routeId}?error=update-stop-failed`);
  }

  const { error } = await supabase
    .from("routepro_stops")
    .update({
      address,
      raw_text: address,
      lat: null,
      lng: null,
      status: "raw",
      geocoding_provider: null,
      geocoding_status: null,
      geocoding_confidence: null,
      geocoding_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stopId);

  if (error) {
    console.error("RoutePro update stop error:", error.message);
    redirect(`/app/routepro/${routeId}?error=update-stop-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?updated=1`);
}

export async function deleteRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();

  if (!routeId) {
    redirect("/app/routepro");
  }

  if (!stopId) {
    redirect(`/app/routepro/${routeId}?error=delete-stop-failed`);
  }

  const { error } = await supabase
    .from("routepro_stops")
    .delete()
    .eq("id", stopId);

  if (error) {
    console.error("RoutePro delete stop error:", error.message);
    redirect(`/app/routepro/${routeId}?error=delete-stop-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?deleted=1`);
}