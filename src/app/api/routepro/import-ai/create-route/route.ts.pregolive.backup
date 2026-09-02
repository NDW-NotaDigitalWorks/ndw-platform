import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddressWithOpenRouteService } from "@/modules/routepro/server/routepro.geocoding";
import { routeProAiImportPreviewStore } from "@/modules/routepro/server/routepro.ai-import-store";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const runtime = "nodejs";

type RouteProStopRole = "start" | "delivery" | "return";
type RouteBoundaryMode = "auto" | "deliveries_only";

type CreateRoutePayload = {
  importId?: string;
  editedStops?: RouteProAiExtractedStop[];
  name?: string;
  routeDate?: string;
  routeProfile?: string;
  startAddress?: string;
  returnAddress?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  breakMinutes?: number;
  boundaryMode?: RouteBoundaryMode;
};

function cleanAddressPart(value: string | null | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function normalizeAddressPart(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSuspiciousHouseNumber(value: string | null | undefined): boolean {
  const normalized = normalizeAddressPart(value);
  if (!normalized) return false;

  const tokens = normalized.split(" ").filter(Boolean);
  return tokens.length > 1 && new Set(tokens).size !== tokens.length;
}

function buildLegacyFullAddress(stop: RouteProAiExtractedStop): string {
  const address = stop.addressRaw.trim();
  const city = stop.city?.trim();
  return city ? `${address}, ${city}` : address;
}

function buildAddressIntelligenceAddress(
  stop: RouteProAiExtractedStop,
  preserveRawAddress = false,
): string | null {
  if (stop.isPlaceholder) return null;

  const confidence =
    typeof stop.interpretationConfidence === "number" &&
    Number.isFinite(stop.interpretationConfidence)
      ? stop.interpretationConfidence
      : null;

  // Address Intelligence may enrich geocoding only when the AI itself
  // considers the geographic interpretation reliable.
  if (confidence === null || confidence < 0.9) return null;

  // A stop explicitly flagged by the extraction layer remains conservative.
  // We can still use safe geographic context, but never a suspicious AI civico.
  const rawAddress = stop.addressRaw.trim();
  if (!rawAddress) return null;

  const aiHouseNumber = cleanAddressPart(stop.houseNumber);
  const safeHouseNumber =
    aiHouseNumber && !hasSuspiciousHouseNumber(aiHouseNumber)
      ? aiHouseNumber
      : null;

  const street = cleanAddressPart(stop.street);
  const municipality = cleanAddressPart(stop.municipality);
  const locality = cleanAddressPart(stop.locality);
  const province = cleanAddressPart(stop.province);
  const postalCode = cleanAddressPart(stop.postalCode);
  const countryCode = cleanAddressPart(stop.countryCode)?.toUpperCase() ?? null;

  // Require at least a reliable municipality before changing the query.
  if (!municipality) return null;

  /*
   * Manual correction authority:
   * addressRaw is the current user-reviewed deliverable address and must never
   * lose information because AI produced a weaker structured interpretation.
   *
   * We only replace the raw street+civico when AI can prove it preserved a
   * valid house number. If AI has no house number, the raw address remains the
   * authority. This specifically prevents cases such as:
   *   raw: "Via G. Galilei 15"
   *   AI street: "Via G. Galilei"
   *   AI houseNumber: null
   * from becoming "Via G. Galilei".
   */
  let primaryAddress = rawAddress;

  // Guard V2: once the user has manually changed addressRaw, that value is
  // authoritative. Address Intelligence may add geographic context below, but
  // it must not rewrite or remove any part of the user's correction.
  if (!preserveRawAddress && street && safeHouseNumber) {
    const normalizedRaw = normalizeAddressPart(rawAddress);
    const normalizedHouse = normalizeAddressPart(safeHouseNumber);

    // Use AI street normalization only if the civic number is still present
    // and therefore no user-visible addressing information is discarded.
    if (normalizedRaw.includes(normalizedHouse)) {
      primaryAddress = `${street} ${safeHouseNumber}`.trim();
    }
  }

  const geographicParts: string[] = [];

  // Keep locality only when it is distinct from the municipality.
  if (
    locality &&
    normalizeAddressPart(locality) !== normalizeAddressPart(municipality)
  ) {
    geographicParts.push(locality);
  }

  geographicParts.push(municipality);

  if (province) geographicParts.push(province);
  if (postalCode) geographicParts.push(postalCode);
  if (countryCode === "IT") geographicParts.push("Italia");

  return [primaryAddress, ...geographicParts].join(", ");
}

function buildFullAddress(
  stop: RouteProAiExtractedStop,
  preserveRawAddress = false,
): string {
  return (
    buildAddressIntelligenceAddress(stop, preserveRawAddress) ??
    buildLegacyFullAddress(stop)
  );
}

function didUserEditAddress(
  stop: RouteProAiExtractedStop,
  originalStopsByNumber: Map<number, RouteProAiExtractedStop>,
): boolean {
  const originalStop = originalStopsByNumber.get(stop.originalStopNumber);

  // Without an original AI preview there is nothing reliable to compare with.
  if (!originalStop) return false;

  return stop.addressRaw.trim() !== originalStop.addressRaw.trim();
}

function classifyImportedStops(
  stops: RouteProAiExtractedStop[],
  boundaryMode: RouteBoundaryMode,
): Array<RouteProAiExtractedStop & { stopRole: RouteProStopRole }> {
  const orderedStops = [...stops].sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );

  const hasEmbeddedBoundaries =
    boundaryMode === "auto" &&
    orderedStops.length >= 3 &&
    orderedStops[0]?.originalStopNumber === 1;

  return orderedStops.map((stop, index) => {
    let stopRole: RouteProStopRole = "delivery";

    if (hasEmbeddedBoundaries && index === 0) {
      stopRole = "start";
    } else if (hasEmbeddedBoundaries && index === orderedStops.length - 1) {
      stopRole = "return";
    }

    return { ...stop, stopRole };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoutePayload;

    if (!body.importId && !body.editedStops?.length) {
      return NextResponse.json(
        { ok: false, message: "Import AI non valido." },
        { status: 400 },
      );
    }

    const preview = body.importId
      ? routeProAiImportPreviewStore.get(body.importId)
      : null;

    const finalStops = body.editedStops?.length
      ? body.editedStops
      : preview?.stops;

    const originalStopsByNumber = new Map<number, RouteProAiExtractedStop>(
      (preview?.stops ?? []).map((stop) => [stop.originalStopNumber, stop]),
    );

    if (!finalStops?.length) {
      return NextResponse.json(
        {
          ok: false,
          message: "Preview AI scaduta. Ripeti l'analisi degli screenshot.",
        },
        { status: 404 },
      );
    }

    const hasBlockingPlaceholders = finalStops.some(
      (stop) => stop.isPlaceholder || stop.addressRaw.trim().length === 0,
    );

    if (hasBlockingPlaceholders) {
      return NextResponse.json(
        {
          ok: false,
          message: "Correggi gli stop mancanti prima di creare la rotta.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const authResult = await supabase.auth.getUser();
    const user = authResult.data.user;

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Utente non autenticato." },
        { status: 401 },
      );
    }

    const boundaryMode: RouteBoundaryMode =
      body.boundaryMode === "auto" ? "auto" : "deliveries_only";

    const classifiedStops = classifyImportedStops(finalStops, boundaryMode);
    const importedStart = classifiedStops.find(
      (stop) => stop.stopRole === "start",
    );
    const importedReturn = classifiedStops.find(
      (stop) => stop.stopRole === "return",
    );

    const today = new Date().toISOString().slice(0, 10);
    const routeDate = body.routeDate?.trim() || today;
    const routeName = body.name?.trim() || `RoutePro - ${routeDate}`;
    const routeProfile = body.routeProfile?.trim() || "generic";

    const startAddress =
      body.startAddress?.trim() ||
      (importedStart
        ? buildFullAddress(
            importedStart,
            didUserEditAddress(importedStart, originalStopsByNumber),
          )
        : null);

        const returnAddress =
      body.returnAddress?.trim() ||
      (importedReturn
        ? buildFullAddress(
            importedReturn,
            didUserEditAddress(importedReturn, originalStopsByNumber),
          )
        : null);

    const [startGeocodeResult, returnGeocodeResult] = await Promise.all([
      startAddress
        ? geocodeAddressWithOpenRouteService(startAddress)
        : Promise.resolve(null),
      returnAddress
        ? geocodeAddressWithOpenRouteService(returnAddress)
        : Promise.resolve(null),
    ]);

    const shiftStartTime = body.shiftStartTime?.trim() || null;
    const shiftEndTime = body.shiftEndTime?.trim() || null;
    const breakMinutes =
      typeof body.breakMinutes === "number" &&
      Number.isFinite(body.breakMinutes)
        ? body.breakMinutes
        : 30;

    const { data: route, error: routeError } = await supabase
      .from("routepro_routes")
      .insert({
        user_id: user.id,
        name: routeName,
        route_date: routeDate,
        status: "draft",
        is_optimized: false,
        optimization_method: null,
        route_profile: routeProfile,
                start_address: startAddress,
        start_lat: startGeocodeResult?.ok ? startGeocodeResult.lat : null,
        start_lng: startGeocodeResult?.ok ? startGeocodeResult.lng : null,

        return_address: returnAddress,
        return_lat: returnGeocodeResult?.ok ? returnGeocodeResult.lat : null,
        return_lng: returnGeocodeResult?.ok ? returnGeocodeResult.lng : null,
        shift_start_time: shiftStartTime,
        shift_end_time: shiftEndTime,
        break_minutes: breakMinutes,
      })
      .select("id")
      .single();

    if (routeError || !route) {
      return NextResponse.json(
        {
          ok: false,
          message: routeError?.message ?? "Creazione rotta non riuscita.",
        },
        { status: 500 },
      );
    }

    console.info(
      "RoutePro Address Intelligence Guard:",
      JSON.stringify(
        classifiedStops.map((stop) => {
          const manuallyEdited = didUserEditAddress(
            stop,
            originalStopsByNumber,
          );
          const selectedAddress = buildFullAddress(stop, manuallyEdited);
          const normalizedSelected = normalizeAddressPart(selectedAddress);
          const normalizedRaw = normalizeAddressPart(stop.addressRaw);
          const normalizedHouseNumber = normalizeAddressPart(
            stop.houseNumber ?? "",
          );

          return {
            originalStopNumber: stop.originalStopNumber,
            raw: buildLegacyFullAddress(stop),
            selected: selectedAddress,
            manuallyEdited,
            manualAddressAuthorityApplied: manuallyEdited,
            usedAddressIntelligence:
              selectedAddress !== buildLegacyFullAddress(stop),
            rawAddressPreserved: normalizedSelected.includes(normalizedRaw),
            rawHouseNumberPreserved:
              normalizedHouseNumber.length === 0 ||
              normalizedSelected.includes(normalizedHouseNumber),
            interpretationConfidence: stop.interpretationConfidence ?? null,
            needsReviewReason: stop.needsReviewReason ?? null,
          };
        }),
        null,
        2,
      ),
    );

    const stopRows = classifiedStops.map((stop, index) => {
      const hasAddress = stop.addressRaw.trim().length > 0;
      const manuallyEdited = didUserEditAddress(stop, originalStopsByNumber);
      const shouldReview =
        stop.isPlaceholder ||
        !hasAddress ||
        stop.confidence === "low" ||
        stop.confidence === "needs_review";

      return {
        route_id: route.id,
        position: index + 1,
        original_position: stop.originalStopNumber,
        address: buildFullAddress(stop, manuallyEdited),
        lat: null,
        lng: null,
        status: shouldReview ? "needs_review" : "valid",
        stop_role: stop.stopRole,
      };
    });

    const { error: stopsError } = await supabase
      .from("routepro_stops")
      .insert(stopRows);

    if (stopsError) {
      await supabase.from("routepro_routes").delete().eq("id", route.id);

      return NextResponse.json(
        {
          ok: false,
          message: `${stopsError.message} | ${stopsError.details ?? ""} | ${stopsError.hint ?? ""} | ${stopsError.code ?? ""}`,
        },
        { status: 500 },
      );
    }

    if (body.importId) {
      routeProAiImportPreviewStore.delete(body.importId);
    }

    return NextResponse.json({
      ok: true,
      routeId: route.id,
      classification: {
        start: classifiedStops.filter((stop) => stop.stopRole === "start").length,
        deliveries: classifiedStops.filter(
          (stop) => stop.stopRole === "delivery",
        ).length,
        return: classifiedStops.filter(
          (stop) => stop.stopRole === "return",
        ).length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Errore imprevisto durante la creazione rotta.",
      },
      { status: 500 },
    );
  }
}