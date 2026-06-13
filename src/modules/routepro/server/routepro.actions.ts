"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddressWithOpenRouteService } from "@/modules/routepro/server/routepro.geocoding";
import { optimizeStopsNearestNeighbor } from "@/modules/routepro/server/routepro.optimization";
import { optimizeStopsWithOpenRouteService } from "@/modules/routepro/server/routepro.ors-optimization";
import { extractTextFromImageWithGoogleVision } from "@/modules/routepro/server/routepro.ocr";
import { encryptRouteProSecret } from "@/modules/routepro/server/routepro.crypto";
import { parseAmazonFlexStopsFromVisionLayout } from "@/modules/routepro/server/routepro.flex-layout-parser";

function getDefaultRouteName(routeDate: string): string {
  return `Route ${routeDate}`;
}

async function runRouteProGeocodingInBatches<T>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    await Promise.all(batch.map((item) => handler(item)));
  }
}

export async function createRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const rawName = String(formData.get("name") ?? "").trim();
  const routeDate = String(formData.get("route_date") ?? "").trim();
  const startAddress = String(formData.get("start_address") ?? "").trim();
  const returnAddress = String(formData.get("return_address") ?? "").trim();
  const shiftStartTime = String(formData.get("shift_start_time") ?? "").trim();
  const shiftEndTime = String(formData.get("shift_end_time") ?? "").trim();
  const breakMinutesRaw = String(formData.get("break_minutes") ?? "30").trim();
  const routeProfile = String(formData.get("route_profile") ?? "generic").trim();

  const breakMinutes = Number.parseInt(breakMinutesRaw, 10);

  if (!routeDate) redirect("/app/routepro/new?error=missing-date");

  const name = rawName || getDefaultRouteName(routeDate);
  const startGeocodeResult = startAddress
  ? await geocodeAddressWithOpenRouteService(startAddress)
  : null;

  const returnGeocodeResult = returnAddress
  ? await geocodeAddressWithOpenRouteService(returnAddress)
  : null;

  const { data, error } = await supabase
    .from("routepro_routes")
    .insert({
      user_id: user.id,
      name,
      route_date: routeDate,
      start_address: startAddress || null,
      start_lat: startGeocodeResult?.ok ? startGeocodeResult.lat : null,
      start_lng: startGeocodeResult?.ok ? startGeocodeResult.lng : null,

      return_address: returnAddress || null,
      return_lat: returnGeocodeResult?.ok ? returnGeocodeResult.lat : null,
      return_lng: returnGeocodeResult?.ok ? returnGeocodeResult.lng : null,
      shift_start_time: shiftStartTime || null,
      shift_end_time: shiftEndTime || null,
      break_minutes: Number.isFinite(breakMinutes) ? breakMinutes : 30,
      route_profile: routeProfile || "generic",
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

  if (!routeId) redirect("/app/routepro");
  if (!address) redirect(`/app/routepro/${routeId}?error=missing-address`);

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

  if (!routeId) redirect("/app/routepro");
  if (!rawText) redirect(`/app/routepro/${routeId}?error=missing-address`);

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

  const { error } = await supabase.from("routepro_stops").insert(rows);

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

  if (userError || !user) redirect("/login");

  const apiKey = String(formData.get("openrouteservice_key") ?? "").trim();

  if (!apiKey) redirect("/app/routepro/settings?error=missing-key");

  const { error } = await supabase.from("routepro_api_keys").upsert(
    {
      user_id: user.id,
      provider: "openrouteservice",
      encrypted_key: encryptRouteProSecret(apiKey),
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
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

  if (!routeId) redirect("/app/routepro");

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

  const GEOCODING_BATCH_SIZE = 5;

  await runRouteProGeocodingInBatches(
    stops,
    GEOCODING_BATCH_SIZE,
    async (stop) => {
      const result = await geocodeAddressWithOpenRouteService(stop.address);

      if (result.ok) {
        const { error } = await supabase
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

        if (error) {
          console.error("RoutePro geocode update success error:", error.message);
        }

        return;
      }

      const { error } = await supabase
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

      if (error) {
        console.error("RoutePro geocode update failed error:", error.message);
      }
    },
  );

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?geocoded=1`);
}

export async function updateRouteProStopAddress(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!routeId) redirect("/app/routepro");

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

  if (!routeId) redirect("/app/routepro");
  if (!stopId) redirect(`/app/routepro/${routeId}?error=delete-stop-failed`);

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

export async function optimizeRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");

  const { data: route, error: routeError } = await supabase
    .from("routepro_routes")
    .select("id, start_lat, start_lng, return_lat, return_lng")
    .eq("id", routeId)
    .maybeSingle();

  if (routeError || !route) {
    console.error("RoutePro optimize route fetch error:", routeError?.message);
    redirect(`/app/routepro/${routeId}?error=optimize-failed`);
  }

  const { data: invalidStops, error: invalidStopsError } = await supabase
    .from("routepro_stops")
    .select("id")
    .eq("route_id", routeId)
    .in("status", ["raw", "needs_review"]);

  if (invalidStopsError) {
    console.error(
      "RoutePro optimize invalid stops fetch error:",
      invalidStopsError.message,
    );
    redirect(`/app/routepro/${routeId}?error=optimize-failed`);
  }

  if (invalidStops && invalidStops.length > 0) {
    redirect(`/app/routepro/${routeId}?error=optimize-needs-review`);
  }

  const { data: stops, error: stopsError } = await supabase
    .from("routepro_stops")
    .select("id, position, original_position, address, lat, lng")
    .eq("route_id", routeId)
    .eq("status", "valid")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("position", { ascending: true });

  if (stopsError) {
    console.error("RoutePro optimize stops fetch error:", stopsError.message);
    redirect(`/app/routepro/${routeId}?error=optimize-failed`);
  }

  if (!stops || stops.length < 2) {
    redirect(`/app/routepro/${routeId}?error=optimize-not-enough-stops`);
  }

  const startPoint =
    route.start_lat !== null && route.start_lng !== null
      ? {
          lat: Number(route.start_lat),
          lng: Number(route.start_lng),
        }
      : null;

  const optimizationStops = stops.map((stop) => ({
  id: stop.id,
  position: Number(stop.position),
  original_position: Number(stop.original_position),
  address: String(stop.address ?? ""),
  lat: Number(stop.lat),
  lng: Number(stop.lng),
}));

const orsResult = await optimizeStopsWithOpenRouteService(
  optimizationStops.map((stop) => ({
    id: stop.id,
    lat: stop.lat,
    lng: stop.lng,
  })),
  startPoint,
);

const sortedByOriginalPosition = [...optimizationStops].sort(
  (a, b) => a.original_position - b.original_position,
);

const hasRouteBoundaries =
  route.start_lat !== null &&
  route.start_lng !== null &&
  route.return_lat !== null &&
  route.return_lng !== null &&
  sortedByOriginalPosition.length >= 3;

const fixedStartStop = hasRouteBoundaries ? sortedByOriginalPosition[0] : null;

const fixedReturnStop = hasRouteBoundaries
  ? sortedByOriginalPosition[sortedByOriginalPosition.length - 1]
  : null;

const stopsToOptimize =
  fixedStartStop && fixedReturnStop
    ? optimizationStops.filter(
        (stop) =>
          stop.id !== fixedStartStop.id &&
          stop.id !== fixedReturnStop.id,
      )
    : optimizationStops;

const optimizedMiddleStops = orsResult.ok
  ? orsResult.orderedStopIds
      .map((stopId) => stopsToOptimize.find((stop) => stop.id === stopId))
      .filter((stop): stop is (typeof optimizationStops)[number] => Boolean(stop))
  : optimizeStopsNearestNeighbor(stopsToOptimize, startPoint);

const optimizedStops =
  fixedStartStop && fixedReturnStop
    ? [fixedStartStop, ...optimizedMiddleStops, fixedReturnStop]
    : optimizedMiddleStops;

const optimizationMethod = orsResult.ok
  ? "ors_optimization_v1"
  : "cluster_nearest_neighbor_2opt_centroid_v1";

  for (let index = 0; index < optimizedStops.length; index += 1) {
    const stop = optimizedStops[index];

    const { error } = await supabase
      .from("routepro_stops")
      .update({
        position: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stop.id);

    if (error) {
      console.error("RoutePro optimize stop update error:", error.message);
      redirect(`/app/routepro/${routeId}?error=optimize-failed`);
    }
  }

  const { error: routeUpdateError } = await supabase
    .from("routepro_routes")
    .update({
      is_optimized: true,
      optimized_at: new Date().toISOString(),
      optimization_method: optimizationMethod,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routeId);

  if (routeUpdateError) {
    console.error("RoutePro optimize route update error:", routeUpdateError.message);
    redirect(`/app/routepro/${routeId}?error=optimize-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?optimized=1`);
}

export async function completeRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");
  if (!stopId) {
    redirect(`/app/routepro/${routeId}/execute?error=complete-failed`);
  }

  const now = new Date().toISOString();

  const { data: currentStop, error: currentStopError } = await supabase
    .from("routepro_stops")
    .select("id,address,status")
    .eq("id", stopId)
    .maybeSingle();

  if (currentStopError || !currentStop) {
    console.error(
      "RoutePro current stop fetch error:",
      currentStopError?.message,
    );

    redirect(`/app/routepro/${routeId}/execute?error=complete-failed`);
  }

  const normalizedAddress = currentStop.address.trim().toLowerCase();

  const { data: duplicateStops, error: duplicateStopsError } = await supabase
    .from("routepro_stops")
    .select("id,address,status")
    .eq("route_id", routeId);

  if (duplicateStopsError) {
    console.error(
      "RoutePro duplicate stop fetch error:",
      duplicateStopsError.message,
    );

    redirect(`/app/routepro/${routeId}/execute?error=complete-failed`);
  }

  const duplicateIds = (duplicateStops ?? [])
    .filter((stop) => {
      const sameAddress =
        stop.address?.trim().toLowerCase() === normalizedAddress;

      const stillOpen =
        stop.status !== "completed" &&
        stop.status !== "skipped";

      return sameAddress && stillOpen;
    })
    .map((stop) => stop.id);

  const { error } = await supabase
    .from("routepro_stops")
    .update({
      status: "completed",
      updated_at: now,
    })
    .in("id", duplicateIds);

  if (error) {
    console.error("RoutePro complete stop error:", error.message);

    redirect(`/app/routepro/${routeId}/execute?error=complete-failed`);
  }

  await supabase
    .from("routepro_routes")
    .update({
      status: "in_progress",
      started_at: now,
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", routeId)
    .is("started_at", null);

  await supabase
    .from("routepro_routes")
    .update({
      status: "in_progress",
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", routeId)
    .not("started_at", "is", null);

  revalidatePath(`/app/routepro/${routeId}/execute`);

  redirect(`/app/routepro/${routeId}/execute?completed=1`);
}

export async function skipRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");
  if (!stopId) redirect(`/app/routepro/${routeId}/execute?error=skip-failed`);

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("routepro_stops")
    .update({
      status: "skipped",
      updated_at: now,
    })
    .eq("id", stopId);

  if (error) {
    console.error("RoutePro skip stop error:", error.message);
    redirect(`/app/routepro/${routeId}/execute?error=skip-failed`);
  }

  await supabase
    .from("routepro_routes")
    .update({
      status: "in_progress",
      started_at: now,
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", routeId)
    .is("started_at", null);

  await supabase
    .from("routepro_routes")
    .update({
      status: "in_progress",
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", routeId)
    .not("started_at", "is", null);

  revalidatePath(`/app/routepro/${routeId}/execute`);
  redirect(`/app/routepro/${routeId}/execute?skipped=1`);
}

export async function completeRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("routepro_routes")
    .update({
      status: "completed",
      completed_at: now,
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", routeId);

  if (error) {
    console.error("RoutePro complete route error:", error.message);
    redirect(`/app/routepro/${routeId}/execute?error=route-complete-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  revalidatePath(`/app/routepro/${routeId}/execute`);
  revalidatePath("/app/routepro");

  redirect(`/app/routepro/${routeId}/execute?routeCompleted=1`);
}

export async function addCsvRouteProStops(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const file = formData.get("csv_file");

  if (!routeId) redirect("/app/routepro");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/app/routepro/${routeId}?error=csv-missing`);
  }

  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    redirect(`/app/routepro/${routeId}?error=csv-invalid`);
  }

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
const addressIndex = headers.indexOf("address");
const cityIndex = headers.indexOf("city");
const provinceIndex = headers.indexOf("province");
const countryIndex = headers.indexOf("country");
const postalCodeIndex = headers.indexOf("postal_code");

if (addressIndex === -1) {
  redirect(`/app/routepro/${routeId}?error=csv-missing-address-column`);
}

const addresses = lines
  .slice(1)
  .map((line) => {
    const columns = line.split(",");

    const address = columns[addressIndex]?.trim() ?? "";
    const city = cityIndex >= 0 ? columns[cityIndex]?.trim() ?? "" : "";
    const province = provinceIndex >= 0 ? columns[provinceIndex]?.trim() ?? "" : "";
    const country = countryIndex >= 0 ? columns[countryIndex]?.trim() ?? "" : "";
    const postalCode = postalCodeIndex >= 0 ? columns[postalCodeIndex]?.trim() ?? "" : "";

    return [address, postalCode, city, province, country]
      .filter((value) => value.length > 0)
      .join(", ");
  })
  .filter((address) => address.length > 0);

  if (addresses.length === 0) {
    redirect(`/app/routepro/${routeId}?error=csv-invalid`);
  }

  const { count, error: countError } = await supabase
    .from("routepro_stops")
    .select("id", { count: "exact", head: true })
    .eq("route_id", routeId);

  if (countError) {
    console.error("RoutePro CSV stop count error:", countError.message);
    redirect(`/app/routepro/${routeId}?error=csv-failed`);
  }

  let nextPosition = (count ?? 0) + 1;

  const rows = addresses.map((address) => {
    const row = {
      route_id: routeId,
      position: nextPosition,
      original_position: nextPosition,
      raw_text: address,
      address,
      status: "raw",
      source: "csv",
    };

    nextPosition += 1;
    return row;
  });

  const { error } = await supabase.from("routepro_stops").insert(rows);

  if (error) {
    console.error("RoutePro CSV import error:", error.message);
    redirect(`/app/routepro/${routeId}?error=csv-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?csvImported=1`);
}

export async function saveRouteProGoogleVisionKey(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const apiKey = String(formData.get("google_vision_key") ?? "").trim();

  if (!apiKey) redirect("/app/routepro/settings?error=missing-vision-key");

  const { error } = await supabase.from("routepro_api_keys").upsert(
    {
      user_id: user.id,
      provider: "google_vision",
      encrypted_key: encryptRouteProSecret(apiKey),
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );

  if (error) {
    console.error("RoutePro Google Vision key save error:", error.message);
    redirect("/app/routepro/settings?error=vision-save-failed");
  }

  redirect("/app/routepro/settings?visionSaved=1");
}

export async function previewRouteProScreenshotOcr(formData: FormData) {
  const routeId = String(formData.get("route_id") ?? "").trim();
  const files = formData.getAll("screenshot_file");

  if (!routeId) redirect("/app/routepro");

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    redirect(`/app/routepro/${routeId}?error=screenshot-missing`);
  }

  const BATCH_SIZE = 10;

  const allParsedStops: {
    originalPosition: number;
    address: string;
    city: string | null;
  }[] = [];

  const fallbackTexts: string[] = [];

  for (let index = 0; index < imageFiles.length; index += BATCH_SIZE) {
    const batch = imageFiles.slice(index, index + BATCH_SIZE);

    for (const file of batch) {
      const result = await extractTextFromImageWithGoogleVision(file);

      if (!result.ok) {
        console.error("RoutePro OCR preview error:", result.message);

        if (result.reason === "missing_key") {
          redirect(`/app/routepro/${routeId}?error=ocr-missing-key`);
        }

        redirect(`/app/routepro/${routeId}?error=ocr-failed`);
      }

      const parsedStops = parseAmazonFlexStopsFromVisionLayout(result.words);

      if (parsedStops.length > 0) {
        allParsedStops.push(
          ...parsedStops.map((stop) => ({
            originalPosition: stop.originalPosition,
            address: stop.address,
            city: stop.city,
          })),
        );
      } else {
        fallbackTexts.push(result.text);
      }
    }
  }

  const uniqueStops = new Map<
    number,
    {
      originalPosition: number;
      address: string;
      city: string | null;
    }
  >();

  for (const stop of allParsedStops) {
    if (!uniqueStops.has(stop.originalPosition)) {
      uniqueStops.set(stop.originalPosition, stop);
    }
  }

  const orderedStops = Array.from(uniqueStops.values()).sort(
    (a, b) => a.originalPosition - b.originalPosition,
  );

  const previewText =
    orderedStops.length > 0
      ? orderedStops
          .map((stop) => {
            const cityPart = stop.city ? `, ${stop.city}` : "";
            return `${stop.originalPosition} | ${stop.address}${cityPart}`;
          })
          .join("\n")
      : fallbackTexts.join("\n\n--- screenshot ---\n\n");

  const encodedText = encodeURIComponent(previewText);

  redirect(`/app/routepro/${routeId}?ocrPreview=${encodedText}`);
}

export async function addScreenshotOcrRouteProStops(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const rawText = String(formData.get("ocr_addresses") ?? "").trim();

  if (!routeId) redirect("/app/routepro");

  if (!rawText) {
    redirect(`/app/routepro/${routeId}?error=ocr-import-empty`);
  }

  const parsedStops = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = line.match(/^(\d{1,3})\s*\|\s*(.+)$/);

      if (!match?.[1] || !match?.[2]) return null;

      return {
        originalPosition: Number(match[1]),
        address: match[2].trim(),
      };
    })
    .filter((item): item is { originalPosition: number; address: string } =>
      Boolean(item),
    )
    .filter((item) => item.originalPosition >= 1 && item.originalPosition <= 200)
    .sort((a, b) => a.originalPosition - b.originalPosition);

  if (parsedStops.length === 0) {
    redirect(`/app/routepro/${routeId}?error=ocr-import-empty`);
  }

  const uniqueStops = new Map<number, { originalPosition: number; address: string }>();

  for (const stop of parsedStops) {
    if (!uniqueStops.has(stop.originalPosition)) {
      uniqueStops.set(stop.originalPosition, stop);
    }
  }

  const orderedStops = Array.from(uniqueStops.values());

  const { count, error: countError } = await supabase
    .from("routepro_stops")
    .select("id", { count: "exact", head: true })
    .eq("route_id", routeId);

  if (countError) {
    console.error("RoutePro OCR stop count error:", countError.message);
    redirect(`/app/routepro/${routeId}?error=ocr-import-failed`);
  }

  let nextPosition = (count ?? 0) + 1;

  const rows = orderedStops.map((stop) => {
    const row = {
      route_id: routeId,
      position: nextPosition,
      original_position: stop.originalPosition,
      raw_text: stop.address,
      address: stop.address,
      status: "raw",
      source: "screenshot",
    };

    nextPosition += 1;
    return row;
  });

  const { error } = await supabase.from("routepro_stops").insert(rows);

  if (error) {
    console.error("RoutePro OCR import error:", error.message);
    redirect(`/app/routepro/${routeId}?error=ocr-import-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`/app/routepro/${routeId}?screenshotImported=1`);
}

export async function deleteRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");

  const { error } = await supabase
    .from("routepro_routes")
    .delete()
    .eq("id", routeId);

  if (error) {
    console.error("RoutePro delete route error:", error.message);
    redirect(`/app/routepro/${routeId}?error=delete-route-failed`);
  }

  revalidatePath("/app/routepro");
  redirect("/app/routepro?routeDeleted=1");
}