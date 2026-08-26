"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddressWithOpenRouteService } from "@/modules/routepro/server/routepro.geocoding";
import { SmartUsageTracker } from "@/modules/routepro/smart-engine/telemetry/usage-tracker";
import { optimizeStopsNearestNeighbor } from "@/modules/routepro/server/routepro.optimization";
import { optimizeStopsWithOpenRouteService } from "@/modules/routepro/server/routepro.ors-optimization";
import { analyzeAmazonRoute } from "@/modules/routepro/server/routepro.amazon-analysis";
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

  if (!routeId) {
    redirect("/app/routepro");
  }

  /*
   * Recuperiamo il contesto geografico della rotta.
   * Non contiene riferimenti fissi a Giussano o ad altre località:
   * funziona con qualsiasi partenza/rientro presente in Italia.
   */
  const { data: route, error: routeError } = await supabase
    .from("routepro_routes")
    .select(
      "id, start_lat, start_lng, return_lat, return_lng",
    )
    .eq("id", routeId)
    .maybeSingle();

  if (routeError || !route) {
    console.error(
      "RoutePro route geocoding context fetch error:",
      routeError?.message,
    );

    redirect(`/app/routepro/${routeId}?error=geocode-failed`);
  }

  const routeContextPoints: Array<{
    lat: number;
    lng: number;
  }> = [];

  const startLat = Number(route.start_lat);
  const startLng = Number(route.start_lng);

  if (
    route.start_lat !== null &&
    route.start_lng !== null &&
    Number.isFinite(startLat) &&
    Number.isFinite(startLng)
  ) {
    routeContextPoints.push({
      lat: startLat,
      lng: startLng,
    });
  }

  const returnLat = Number(route.return_lat);
  const returnLng = Number(route.return_lng);

  if (
    route.return_lat !== null &&
    route.return_lng !== null &&
    Number.isFinite(returnLat) &&
    Number.isFinite(returnLng)
  ) {
    routeContextPoints.push({
      lat: returnLat,
      lng: returnLng,
    });
  }

  const focusPoint =
    routeContextPoints.length > 0
      ? {
          lat:
            routeContextPoints.reduce(
              (sum, point) => sum + point.lat,
              0,
            ) / routeContextPoints.length,
          lng:
            routeContextPoints.reduce(
              (sum, point) => sum + point.lng,
              0,
            ) / routeContextPoints.length,
        }
      : null;

  const { data: stops, error: stopsError } = await supabase
    .from("routepro_stops")
    .select("id, address, status, lat, lng")
    .eq("route_id", routeId)
    .order("position", { ascending: true });

  if (stopsError) {
    console.error(
      "RoutePro stops geocode fetch error:",
      stopsError.message,
    );

    redirect(`/app/routepro/${routeId}?error=geocode-failed`);
  }

  const stopsToGeocode =
    stops?.filter((stop) => {
      const hasCoordinates =
        stop.lat !== null && stop.lng !== null;

      return (
        stop.status === "raw" ||
        stop.status === "needs_review" ||
        !hasCoordinates
      );
    }) ?? [];

  if (stopsToGeocode.length === 0) {
    redirect(`/app/routepro/${routeId}?geocoded=0`);
  }

  const GEOCODING_BATCH_SIZE = 2;
  const usageTracker = new SmartUsageTracker();

  await runRouteProGeocodingInBatches(
    stopsToGeocode,
    GEOCODING_BATCH_SIZE,
    async (stop) => {
      const result =
        await geocodeAddressWithOpenRouteService(
          stop.address,
          {
            focusPoint,

            /*
             * Protezione contro risultati palesemente fuori area.
             * Non delimita una città specifica: usa la partenza/rientro
             * della singola rotta come riferimento geografico.
             *
             * 120 km è volutamente ampio per non penalizzare rotte
             * estese, ma impedisce errori come Lombardia -> Sicilia.
             */
            maxDistanceKm: focusPoint ? 120 : null,
            usageTracker,
          },
        );

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
          console.error(
            "RoutePro geocode update success error:",
            error.message,
          );
        }

        return;
      }

      /*
       * Se nessun candidato è sufficientemente affidabile,
       * eliminiamo eventuali vecchie coordinate e obblighiamo
       * il controllo manuale. L'ottimizzatore non potrà quindi
       * usare coordinate sospette.
       */
      const { error } = await supabase
        .from("routepro_stops")
        .update({
          lat: null,
          lng: null,
          status: "needs_review",
          geocoding_provider: result.provider,
          geocoding_status:
            result.reason === "missing_key"
              ? "missing_key"
              : "failed",
          geocoding_confidence: null,
          geocoding_error: result.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stop.id);

      if (error) {
        console.error(
          "RoutePro geocode update failed error:",
          error.message,
        );
      }
    },
  );

  const usageReport = usageTracker.buildReport();

  console.info("RoutePro Smart Geocoding Report:", {
    routeId,
    stopsRequestedForGeocoding: stopsToGeocode.length,
    ...usageReport,
  });

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


type RouteProOptimizationDiagnosticStop = {
  id: string;
  position: number;
  original_position: number;
  address: string;
  lat: number;
  lng: number;
  stop_role: "start" | "delivery" | "return";
};

function routeProDiagnosticDistanceKm(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
): number {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(second.lat - first.lat);
  const dLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const haversine =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function routeProDiagnosticRouteDistanceMeters(
  stops: RouteProOptimizationDiagnosticStop[],
  startPoint?: { lat: number; lng: number } | null,
  endPoint?: { lat: number; lng: number } | null,
): number {
  if (stops.length === 0) return 0;

  let totalKm = 0;
  let currentPoint =
    startPoint ?? { lat: stops[0].lat, lng: stops[0].lng };

  for (const stop of stops) {
    totalKm += routeProDiagnosticDistanceKm(currentPoint, stop);
    currentPoint = { lat: stop.lat, lng: stop.lng };
  }

  if (endPoint) {
    totalKm += routeProDiagnosticDistanceKm(currentPoint, endPoint);
  }

  return Math.round(totalKm * 1000);
}

function routeProDiagnosticGreedyNearestNeighbor(
  stops: RouteProOptimizationDiagnosticStop[],
  startPoint?: { lat: number; lng: number } | null,
): RouteProOptimizationDiagnosticStop[] {
  if (stops.length <= 1) return [...stops];

  const remaining = [...stops];
  const ordered: RouteProOptimizationDiagnosticStop[] = [];
  let currentPoint =
    startPoint ?? { lat: remaining[0].lat, lng: remaining[0].lng };

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const distance = routeProDiagnosticDistanceKm(currentPoint, candidate);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }

    const [nextStop] = remaining.splice(bestIndex, 1);
    ordered.push(nextStop);
    currentPoint = { lat: nextStop.lat, lng: nextStop.lng };
  }

  return ordered;
}

function routeProDiagnosticChangedStopCount(
  originalStops: RouteProOptimizationDiagnosticStop[],
  candidateStops: RouteProOptimizationDiagnosticStop[],
): number {
  const originalIndexById = new Map(
    originalStops.map((stop, index) => [stop.id, index]),
  );

  return candidateStops.filter(
    (stop, index) => originalIndexById.get(stop.id) !== index,
  ).length;
}


function routeProDiagnosticGlobalStreetKeyV6(address: string): string {
  return ((address.split(",")[0] ?? address)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b\d+[a-z]?(?:\/[a-z0-9]+)?\b/gi, " ")
    .replace(/[#.,;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function routeProDiagnosticStreetReentriesV6(
  stops: RouteProOptimizationDiagnosticStop[],
  minimumGap = 3,
): number {
  const indexesByStreet = new Map<string, number[]>();

  stops.forEach((stop, index) => {
    const key = routeProDiagnosticGlobalStreetKeyV6(stop.address);
    if (!key) return;
    const indexes = indexesByStreet.get(key) ?? [];
    indexes.push(index);
    indexesByStreet.set(key, indexes);
  });

  let reentries = 0;
  for (const indexes of indexesByStreet.values()) {
    for (let index = 1; index < indexes.length; index += 1) {
      if (indexes[index] - indexes[index - 1] >= minimumGap) {
        reentries += 1;
      }
    }
  }

  return reentries;
}

function routeProDiagnosticAreaReentriesV6(
  stops: RouteProOptimizationDiagnosticStop[],
  radiusKm: number,
  minimumGap: number,
): number {
  let reentries = 0;

  for (
    let currentIndex = minimumGap;
    currentIndex < stops.length;
    currentIndex += 1
  ) {
    const currentStop = stops[currentIndex];
    const previousStop = stops[currentIndex - 1];

    for (
      let oldIndex = 0;
      oldIndex <= currentIndex - minimumGap;
      oldIndex += 1
    ) {
      const oldStop = stops[oldIndex];

      if (
        routeProDiagnosticDistanceKm(currentStop, oldStop) > radiusKm
      ) {
        continue;
      }

      if (
        routeProDiagnosticDistanceKm(previousStop, oldStop) > radiusKm
      ) {
        reentries += 1;
        break;
      }
    }
  }

  return reentries;
}

function routeProDiagnosticContinuityMetricsV6(
  stops: RouteProOptimizationDiagnosticStop[],
) {
  return {
    streetReentriesGlobal:
      routeProDiagnosticStreetReentriesV6(stops),
    neighborhoodReentries500m:
      routeProDiagnosticAreaReentriesV6(stops, 0.5, 5),
    zoneReentries1500m:
      routeProDiagnosticAreaReentriesV6(stops, 1.5, 7),
    macroZoneReentries3000m:
      routeProDiagnosticAreaReentriesV6(stops, 3.0, 10),
  };
}

type RouteProContinuityFirstResultV6 = {
  orderedStops: RouteProOptimizationDiagnosticStop[];
  analysis: ReturnType<typeof analyzeAmazonRoute>;
  distanceMeters: number;
  passes: number;
  acceptedMoves: number;
  evaluatedCandidates: number;
  continuity: ReturnType<typeof routeProDiagnosticContinuityMetricsV6>;
};

function routeProContinuityFirstOptimizeV6(
  originalStops: RouteProOptimizationDiagnosticStop[],
  startPoint?: { lat: number; lng: number } | null,
  endPoint?: { lat: number; lng: number } | null,
): RouteProContinuityFirstResultV6 {
  // Continuity-first baseline: Greedy won the V5 real-route test on
  // neighborhood/zone re-entry metrics.
  let currentStops = routeProDiagnosticGreedyNearestNeighbor(
    originalStops,
    startPoint,
  );
  let currentAnalysis = analyzeAmazonRoute(currentStops);
  let currentDistance = routeProDiagnosticRouteDistanceMeters(
    currentStops,
    startPoint,
    endPoint,
  );
  let currentContinuity =
    routeProDiagnosticContinuityMetricsV6(currentStops);

  const MAX_PASSES = 8;
  const MAX_REVERSAL_SPAN = 26;
  const TOP_CANDIDATES_PER_PASS = 48;
  const MIN_DISTANCE_GAIN_METERS = 35;

  let acceptedMoves = 0;
  let evaluatedCandidates = 0;
  let completedPasses = 0;

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    completedPasses += 1;

    const distanceCandidates: {
      orderedStops: RouteProOptimizationDiagnosticStop[];
      distanceMeters: number;
      distanceGainMeters: number;
    }[] = [];

    for (
      let fromIndex = 0;
      fromIndex < currentStops.length - 2;
      fromIndex += 1
    ) {
      const maxToIndex = Math.min(
        currentStops.length - 1,
        fromIndex + MAX_REVERSAL_SPAN,
      );

      for (
        let toIndex = fromIndex + 1;
        toIndex <= maxToIndex;
        toIndex += 1
      ) {
        const candidateStops = [
          ...currentStops.slice(0, fromIndex),
          ...currentStops.slice(fromIndex, toIndex + 1).reverse(),
          ...currentStops.slice(toIndex + 1),
        ];

        const candidateDistance =
          routeProDiagnosticRouteDistanceMeters(
            candidateStops,
            startPoint,
            endPoint,
          );
        const distanceGain = currentDistance - candidateDistance;

        if (distanceGain >= MIN_DISTANCE_GAIN_METERS) {
          distanceCandidates.push({
            orderedStops: candidateStops,
            distanceMeters: candidateDistance,
            distanceGainMeters: distanceGain,
          });
        }
      }
    }

    const shortlist = distanceCandidates
      .sort(
        (first, second) =>
          second.distanceGainMeters - first.distanceGainMeters,
      )
      .slice(0, TOP_CANDIDATES_PER_PASS);

    let best:
      | {
          orderedStops: RouteProOptimizationDiagnosticStop[];
          analysis: ReturnType<typeof analyzeAmazonRoute>;
          continuity: ReturnType<
            typeof routeProDiagnosticContinuityMetricsV6
          >;
          distanceMeters: number;
          utility: number;
        }
      | null = null;

    for (const candidate of shortlist) {
      evaluatedCandidates += 1;

      const continuity =
        routeProDiagnosticContinuityMetricsV6(
          candidate.orderedStops,
        );

      // Hard rule: saving meters can never reopen a street/area more often.
      if (
        continuity.streetReentriesGlobal >
          currentContinuity.streetReentriesGlobal ||
        continuity.neighborhoodReentries500m >
          currentContinuity.neighborhoodReentries500m ||
        continuity.zoneReentries1500m >
          currentContinuity.zoneReentries1500m ||
        continuity.macroZoneReentries3000m >
          currentContinuity.macroZoneReentries3000m
      ) {
        continue;
      }

      const analysis = analyzeAmazonRoute(candidate.orderedStops);

      if (
        analysis.counts.nearbyStopRevisits >
          currentAnalysis.counts.nearbyStopRevisits ||
        analysis.counts.streetRevisits >
          currentAnalysis.counts.streetRevisits ||
        analysis.estimatedCorrections >
          currentAnalysis.estimatedCorrections
      ) {
        continue;
      }

      const neighborhoodGain =
        currentContinuity.neighborhoodReentries500m -
        continuity.neighborhoodReentries500m;
      const zoneGain =
        currentContinuity.zoneReentries1500m -
        continuity.zoneReentries1500m;
      const macroGain =
        currentContinuity.macroZoneReentries3000m -
        continuity.macroZoneReentries3000m;
      const streetGain =
        currentContinuity.streetReentriesGlobal -
        continuity.streetReentriesGlobal;
      const nearbyGain =
        currentAnalysis.counts.nearbyStopRevisits -
        analysis.counts.nearbyStopRevisits;
      const correctionsGain =
        currentAnalysis.estimatedCorrections -
        analysis.estimatedCorrections;

      // Time/mental-load proxy: zone continuity is deliberately weighted
      // more heavily than a small geometric saving.
      const utility =
        candidate.distanceGainMeters +
        neighborhoodGain * 180 +
        zoneGain * 320 +
        macroGain * 520 +
        streetGain * 180 +
        nearbyGain * 220 +
        correctionsGain * 120;

      if (!best || utility > best.utility) {
        best = {
          orderedStops: candidate.orderedStops,
          analysis,
          continuity,
          distanceMeters: candidate.distanceMeters,
          utility,
        };
      }
    }

    if (!best || best.utility <= 0) {
      break;
    }

    currentStops = best.orderedStops;
    currentAnalysis = best.analysis;
    currentContinuity = best.continuity;
    currentDistance = best.distanceMeters;
    acceptedMoves += 1;
  }

  return {
    orderedStops: currentStops,
    analysis: currentAnalysis,
    distanceMeters: currentDistance,
    passes: completedPasses,
    acceptedMoves,
    evaluatedCandidates,
    continuity: currentContinuity,
  };
}

export async function optimizeRouteProRoute(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();

  const isWorkflowV2 = String(formData.get("workflow") ?? "") === "v2";

const optimizeRedirectBase = isWorkflowV2
  ? `/app/routepro/routes/${routeId}/optimize`
  : `/app/routepro/${routeId}`;

  if (!routeId) redirect("/app/routepro");

  const { data: route, error: routeError } = await supabase
    .from("routepro_routes")
    .select(
  "id, route_profile, start_address, start_lat, start_lng, return_address, return_lat, return_lng",
)
    .eq("id", routeId)
    .maybeSingle();

  if (routeError || !route) {
    console.error("RoutePro optimize route fetch error:", routeError?.message);
    redirect(`${optimizeRedirectBase}?error=optimize-failed`);
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
    redirect(`${optimizeRedirectBase}?error=optimize-failed`);
  }

  if (invalidStops && invalidStops.length > 0) {
    redirect(`${optimizeRedirectBase}?error=optimize-needs-review`);
  }

  const { data: stops, error: stopsError } = await supabase
    .from("routepro_stops")
    .select(
  "id, position, original_position, address, lat, lng, stop_role",
)
    .eq("route_id", routeId)
    .eq("status", "valid")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("position", { ascending: true });

  if (stopsError) {
    console.error("RoutePro optimize stops fetch error:", stopsError.message);
    redirect(`${optimizeRedirectBase}?error=optimize-failed`);
  }

  if (!stops || stops.length < 2) {
    redirect(`${optimizeRedirectBase}?error=optimize-not-enough-stops`);
  }

    const optimizationStops = stops.map((stop) => {
    const normalizedStopRole = String(
      stop.stop_role ?? "delivery",
    ).toLowerCase();

    const stopRole =
      normalizedStopRole === "start" || normalizedStopRole === "return"
        ? normalizedStopRole
        : "delivery";

    return {
      id: stop.id,
      position: Number(stop.position),
      original_position: Number(stop.original_position),
      address: String(stop.address ?? ""),
      lat: Number(stop.lat),
      lng: Number(stop.lng),
      stop_role: stopRole as "start" | "delivery" | "return",
    };
  });

  const fixedStartStop =
    optimizationStops.find((stop) => stop.stop_role === "start") ?? null;

  const fixedReturnStop =
    optimizationStops.find((stop) => stop.stop_role === "return") ?? null;

  const stopsToOptimize = optimizationStops.filter(
    (stop) => stop.stop_role === "delivery",
  );

  const startPoint = fixedStartStop
    ? {
        lat: fixedStartStop.lat,
        lng: fixedStartStop.lng,
      }
    : route.start_lat !== null && route.start_lng !== null
      ? {
          lat: Number(route.start_lat),
          lng: Number(route.start_lng),
        }
      : null;

  const endPoint = fixedReturnStop
    ? {
        lat: fixedReturnStop.lat,
        lng: fixedReturnStop.lng,
      }
    : route.return_lat !== null && route.return_lng !== null
      ? {
          lat: Number(route.return_lat),
          lng: Number(route.return_lng),
        }
      : null;

  let optimizedStops = optimizationStops;

let optimizationMethod = "analysis_only";

let amazonAssistReport: {
  version: 1;
  generated_at: string;
  method: string;
  changed: boolean;
  changed_stop_count: number;
  applied_saving_meters: number;
  applied_saving_seconds: number;
  original_analysis: unknown;
  final_analysis: unknown;
  corrections: unknown[];
} | null = null;

const normalizedProfile = String(
  route.route_profile ?? "generic",
).toLowerCase();

if (normalizedProfile === "amazon_flex") {
  const originalDeliverySequence = [
    ...stopsToOptimize,
  ] as RouteProOptimizationDiagnosticStop[];

  const originalAnalysis = analyzeAmazonRoute(originalDeliverySequence);
  const originalGeometricDistanceMeters =
    routeProDiagnosticRouteDistanceMeters(
      originalDeliverySequence,
      startPoint,
      endPoint,
    );

  const continuityFirstV6 = routeProContinuityFirstOptimizeV6(
    originalDeliverySequence,
    startPoint,
    endPoint,
  );

  const originalContinuityV6 =
    routeProDiagnosticContinuityMetricsV6(originalDeliverySequence);

  const distanceSavingMeters =
    originalGeometricDistanceMeters - continuityFirstV6.distanceMeters;
  const distanceSavingPercent =
    originalGeometricDistanceMeters > 0
      ? distanceSavingMeters / originalGeometricDistanceMeters
      : 0;

  const nearbyReduction =
    originalAnalysis.counts.nearbyStopRevisits -
    continuityFirstV6.analysis.counts.nearbyStopRevisits;
  const streetRevisitReduction =
    originalAnalysis.counts.streetRevisits -
    continuityFirstV6.analysis.counts.streetRevisits;
  const correctionReduction =
    originalAnalysis.estimatedCorrections -
    continuityFirstV6.analysis.estimatedCorrections;

  const neighborhoodReduction =
    originalContinuityV6.neighborhoodReentries500m -
    continuityFirstV6.continuity.neighborhoodReentries500m;
  const zoneReduction =
    originalContinuityV6.zoneReentries1500m -
    continuityFirstV6.continuity.zoneReentries1500m;
  const macroZoneReduction =
    originalContinuityV6.macroZoneReentries3000m -
    continuityFirstV6.continuity.macroZoneReentries3000m;
  const streetReentryReduction =
    originalContinuityV6.streetReentriesGlobal -
    continuityFirstV6.continuity.streetReentriesGlobal;

  const noContinuityRegression =
    continuityFirstV6.analysis.counts.nearbyStopRevisits <=
      originalAnalysis.counts.nearbyStopRevisits &&
    continuityFirstV6.analysis.counts.streetRevisits <=
      originalAnalysis.counts.streetRevisits &&
    continuityFirstV6.analysis.estimatedCorrections <=
      originalAnalysis.estimatedCorrections &&
    continuityFirstV6.continuity.streetReentriesGlobal <=
      originalContinuityV6.streetReentriesGlobal &&
    continuityFirstV6.continuity.neighborhoodReentries500m <=
      originalContinuityV6.neighborhoodReentries500m &&
    continuityFirstV6.continuity.zoneReentries1500m <=
      originalContinuityV6.zoneReentries1500m &&
    continuityFirstV6.continuity.macroZoneReentries3000m <=
      originalContinuityV6.macroZoneReentries3000m;

  const meaningfulDistanceGain =
    distanceSavingMeters >=
    Math.max(500, originalGeometricDistanceMeters * 0.04);

  const meaningfulContinuityGain =
    nearbyReduction >= 3 ||
    neighborhoodReduction >= 2 ||
    zoneReduction >= 2 ||
    macroZoneReduction >= 1 ||
    streetReentryReduction >= 2 ||
    correctionReduction >= 3;

  const originalAlreadyGood =
    originalAnalysis.counts.nearbyStopRevisits <= 5 &&
    originalAnalysis.counts.streetRevisits <= 4 &&
    originalContinuityV6.neighborhoodReentries500m <= 6 &&
    originalContinuityV6.zoneReentries1500m <= 4 &&
    originalContinuityV6.macroZoneReentries3000m <= 1;

  const strongGainForAlreadyGoodRoute =
    distanceSavingMeters > 0 && distanceSavingPercent >= 0.08;

  const shouldApplyContinuityFirst =
    noContinuityRegression &&
    distanceSavingMeters > 0 &&
    (originalAlreadyGood
      ? strongGainForAlreadyGoodRoute
      : meaningfulDistanceGain || meaningfulContinuityGain);

  const selectedOptimizationMethod = shouldApplyContinuityFirst
    ? "routepro_continuity_first_adaptive_v1"
    : "routepro_preserve_source_sequence_v1";

  const selectedDeliverySequence = shouldApplyContinuityFirst
    ? continuityFirstV6.orderedStops
    : originalDeliverySequence;

  const selectedAnalysis = shouldApplyContinuityFirst
    ? continuityFirstV6.analysis
    : originalAnalysis;

  const selectedChangedStopCount = shouldApplyContinuityFirst
    ? routeProDiagnosticChangedStopCount(
        originalDeliverySequence,
        continuityFirstV6.orderedStops,
      )
    : 0;

  console.info("RoutePro Adaptive Optimization:", {
    method: selectedOptimizationMethod,
    applied: shouldApplyContinuityFirst,
    stopCount: originalDeliverySequence.length,
    distanceSavingMeters: Math.max(0, distanceSavingMeters),
    distanceSavingPercent: Number((distanceSavingPercent * 100).toFixed(2)),
    nearbyReduction,
    streetRevisitReduction,
    neighborhoodReduction,
    zoneReduction,
    macroZoneReduction,
  });

  amazonAssistReport = {
    version: 1,
    generated_at: new Date().toISOString(),
    method: selectedOptimizationMethod,
    changed: shouldApplyContinuityFirst,
    changed_stop_count: selectedChangedStopCount,
    applied_saving_meters: shouldApplyContinuityFirst
      ? Math.max(0, distanceSavingMeters)
      : 0,
    applied_saving_seconds: shouldApplyContinuityFirst
      ? Math.round(Math.max(0, distanceSavingMeters) / 8)
      : 0,
    original_analysis: {
      ...originalAnalysis,
      continuity: originalContinuityV6,
      geometric_distance_meters: originalGeometricDistanceMeters,
    },
    final_analysis: {
      ...selectedAnalysis,
      continuity: shouldApplyContinuityFirst
        ? continuityFirstV6.continuity
        : originalContinuityV6,
      geometric_distance_meters: shouldApplyContinuityFirst
        ? continuityFirstV6.distanceMeters
        : originalGeometricDistanceMeters,
      adaptive_decision: {
        original_already_good: originalAlreadyGood,
        no_continuity_regression: noContinuityRegression,
        distance_saving_meters: distanceSavingMeters,
        distance_saving_percent: Number(
          (distanceSavingPercent * 100).toFixed(2),
        ),
        nearby_reduction: nearbyReduction,
        street_revisit_reduction: streetRevisitReduction,
        correction_reduction: correctionReduction,
        street_reentry_reduction: streetReentryReduction,
        neighborhood_reduction: neighborhoodReduction,
        zone_reduction: zoneReduction,
        macro_zone_reduction: macroZoneReduction,
      },
    },
    corrections: [],
  };

  const selectedDeliveryStops = selectedDeliverySequence
    .map((selectedStop) =>
      optimizationStops.find((stop) => stop.id === selectedStop.id),
    )
    .filter(
      (stop): stop is (typeof optimizationStops)[number] => Boolean(stop),
    );

  optimizedStops = [
    ...(fixedStartStop ? [fixedStartStop] : []),
    ...selectedDeliveryStops,
    ...(fixedReturnStop ? [fixedReturnStop] : []),
  ];

  optimizationMethod = selectedOptimizationMethod;
} else {
  const orsResult = await optimizeStopsWithOpenRouteService(
    stopsToOptimize.map((stop) => ({
      id: stop.id,
      lat: stop.lat,
      lng: stop.lng,
    })),
    startPoint,
    endPoint,
  );

  const optimizedDeliveryStopIds = orsResult.ok
  ? orsResult.orderedStopIds
  : optimizeStopsNearestNeighbor(
      stopsToOptimize,
      startPoint,
    ).map((stop) => stop.id);

const optimizedDeliveryStops = optimizedDeliveryStopIds
  .map((stopId) =>
    stopsToOptimize.find((stop) => stop.id === stopId),
  )
  .filter(
    (
      stop,
    ): stop is (typeof stopsToOptimize)[number] => Boolean(stop),
  );

  optimizedStops = [
    ...(fixedStartStop ? [fixedStartStop] : []),
    ...optimizedDeliveryStops,
    ...(fixedReturnStop ? [fixedReturnStop] : []),
  ];

  optimizationMethod = orsResult.ok
    ? "ors_optimization_v2_boundaries"
    : "nearest_neighbor_boundaries_v2";
}

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
      redirect(`${optimizeRedirectBase}?error=optimize-failed`);
    }
  }

  const { error: routeUpdateError } = await supabase
    .from("routepro_routes")
    .update({
      is_optimized: true,
      optimized_at: new Date().toISOString(),
      optimization_method: optimizationMethod,
      amazon_assist_report: amazonAssistReport,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routeId);

  if (routeUpdateError) {
    console.error("RoutePro optimize route update error:", routeUpdateError.message);
    redirect(`${optimizeRedirectBase}?error=optimize-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  redirect(`${optimizeRedirectBase}?optimized=1`);
}

export async function completeRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");
  if (!stopId) {
    redirect(`/app/routepro/routes/${routeId}/drive?error=complete-failed`);
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

    redirect(`/app/routepro/routes/${routeId}/drive?error=complete-failed`);
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

    redirect(`/app/routepro/routes/${routeId}/drive?error=complete-failed`);
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
  completed_at: now,
  skipped_at: null,
  updated_at: now,
})
    .in("id", duplicateIds);

  if (error) {
    console.error("RoutePro complete stop error:", error.message);

    redirect(`/app/routepro/routes/${routeId}/drive?error=complete-failed`);
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

  revalidatePath(`/app/routepro/routes/${routeId}/drive`);

  redirect(`/app/routepro/routes/${routeId}/drive?completed=1`);
}

export async function skipRouteProStop(formData: FormData) {
  const supabase = await createClient();

  const routeId = String(formData.get("route_id") ?? "").trim();
  const stopId = String(formData.get("stop_id") ?? "").trim();

  if (!routeId) redirect("/app/routepro");
  if (!stopId) redirect(`/app/routepro/routes/${routeId}/drive?error=skip-failed`);

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("routepro_stops")
    .update({
  status: "skipped",
  skipped_at: now,
  completed_at: null,
  updated_at: now,
})
    .eq("id", stopId);

  if (error) {
    console.error("RoutePro skip stop error:", error.message);
    redirect(`/app/routepro/routes/${routeId}/drive?error=skip-failed`);
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

  revalidatePath(`/app/routepro/routes/${routeId}/drive`);
  redirect(`/app/routepro/routes/${routeId}/drive?skipped=1`);
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
    redirect(`/app/routepro/routes/${routeId}/drive?error=route-complete-failed`);
  }

  revalidatePath(`/app/routepro/${routeId}`);
  revalidatePath(`/app/routepro/routes/${routeId}/drive`);
  revalidatePath("/app/routepro");

  redirect(`/app/routepro/routes/${routeId}/drive?routeCompleted=1`);
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