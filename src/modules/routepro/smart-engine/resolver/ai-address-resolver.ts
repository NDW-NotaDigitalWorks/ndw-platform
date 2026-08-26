import OpenAI from "openai";
import { getRouteProNdwMapboxAccessToken } from "@/modules/routepro/server/routepro.ai-config";

export const ROUTEPRO_AI_ADDRESS_RESOLVER_VERSION = "2.2.1-toponym-targeted-verification";

type FocusPoint = { lat: number; lng: number };

type CanonicalInput = {
  streetName: string | null;
  houseNumber: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  countryCode: string | null;
};

type RejectedCandidate = {
  provider: string;
  label: string | null;
  street: string | null;
  houseNumber: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  layer: string | null;
  confidence: number | null;
  score: number;
  evidence: string[];
  lat: number | null;
  lng: number | null;
};

type SearchBoxFeature = {
  properties?: {
    name?: string;
    name_preferred?: string;
    feature_type?: string;
    address?: string;
    full_address?: string;
    context?: {
      address?: { address_number?: string; street_name?: string; name?: string };
      locality?: { name?: string };
      neighborhood?: { name?: string };
      place?: { name?: string };
      district?: { name?: string };
      region?: { name?: string };
    };
    poi_category?: string[];
  };
};

type SearchBoxResponse = { features?: SearchBoxFeature[] };

type GooglePlace = {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
};

type GoogleTextSearchResponse = { places?: GooglePlace[] };

export type RouteProPoiEvidence = {
  source: "mapbox_searchbox" | "google_places";
  placeId: string | null;
  name: string | null;
  featureType: string | null;
  address: string | null;
  fullAddress: string | null;
  city: string | null;
  locality: string | null;
  province: string | null;
  categories: string[];
  distanceFromFocusKm: number | null;
  // Google coordinates are transient evidence only. They may be returned to the
  // caller for a TTL-limited exact-address rescue, but must never enter the
  // permanent RoutePro geocode cache.
  lat: number | null;
  lng: number | null;
};

export type RouteProAiAddressResolverResult = {
  version: string;
  classification:
    | "address"
    | "named_place"
    | "poi"
    | "complex"
    | "locality"
    | "possible_typo"
    | "unknown";
  confidence: number;
  queries: string[];
  rejectedQueries: Array<{ query: string; reason: string }>;
  reason: string;
  poiEvidence: RouteProPoiEvidence[];
  googleExactAddressRescue: {
    placeId: string;
    lat: number;
    lng: number;
    confidence: number;
    expiresAt: string;
  } | null;
  toponymConsensusRescue: {
    lat: number;
    lng: number;
    label: string;
    confidence: number;
    originalIdentity: string;
    resolvedIdentity: string;
    googlePlaceId: string;
    consensusDistanceKm: number;
  } | null;
};

function normalizeComparable(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(a: FocusPoint, b: FocusPoint): number {
  const r = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

function stripLikelyHouseNumber(address: string): string {
  const parts = address.split(",");
  const first = parts[0]?.trim() ?? address.trim();
  const withoutNumber = first
    .replace(/\s+\d{1,5}(?:\s*[a-zA-Z]|\/[a-zA-Z0-9]+)?\s*$/i, "")
    .trim();
  return [withoutNumber, ...parts.slice(1)]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function coreIdentity(value: string): string {
  return normalizeComparable(stripLikelyHouseNumber(value).split(",")[0])
    .replace(/^(via|viale|vicolo|piazza|piazzale|corso|strada|largo|localita|localita)\s+/, "")
    .trim();
}

function buildPlaceQueries(address: string, canonical: CanonicalInput): string[] {
  const placeName = stripLikelyHouseNumber(address).split(",")[0]?.trim() ?? "";
  const geography = [
    canonical.locality,
    canonical.city,
    canonical.province,
    canonical.postalCode,
    canonical.countryCode === "IT" ? "Italia" : canonical.countryCode,
  ].filter((value): value is string => Boolean(value?.trim())).join(", ");

  return Array.from(new Set([
    address,
    placeName && geography ? `${placeName}, ${geography}` : placeName,
    canonical.streetName && geography ? `${canonical.streetName}, ${geography}` : canonical.streetName,
  ].map((q) => q?.replace(/\s+/g, " ").trim()).filter(Boolean))).slice(0, 3) as string[];
}

function getGoogleApiKey(): string | null {
  const key = process.env.NDW_GOOGLE_PLACES_API_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key || null;
}

async function searchGooglePlaces(params: {
  address: string;
  canonical: CanonicalInput;
  focusPoint?: FocusPoint | null;
}): Promise<RouteProPoiEvidence[]> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    console.warn("RoutePro Google Places Evidence unavailable: missing NDW_GOOGLE_PLACES_API_KEY/GOOGLE_MAPS_API_KEY.");
    return [];
  }

  const queries = buildPlaceQueries(params.address, params.canonical).slice(0, 2);
  const seen = new Set<string>();
  const out: RouteProPoiEvidence[] = [];

  for (const textQuery of queries) {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode: "it",
      regionCode: "IT",
      pageSize: 5,
    };

    if (params.focusPoint) {
      body.locationBias = {
        circle: {
          center: {
            latitude: params.focusPoint.lat,
            longitude: params.focusPoint.lng,
          },
          radius: 25000,
        },
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.types",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        console.warn("RoutePro Google Places Evidence error:", response.status, await response.text().catch(() => ""));
        continue;
      }

      const json = (await response.json()) as GoogleTextSearchResponse;
      for (const place of json.places ?? []) {
        const key = place.id ?? normalizeComparable(`${place.displayName?.text}|${place.formattedAddress}`);
        if (!key || seen.has(key)) continue;
        seen.add(key);

        const lat = place.location?.latitude;
        const lng = place.location?.longitude;
        const distance = params.focusPoint && Number.isFinite(lat) && Number.isFinite(lng)
          ? distanceKm(params.focusPoint, { lat: Number(lat), lng: Number(lng) })
          : null;

        // IMPORTANT: Google coordinates are used only transiently for evidence/ranking.
        // They are deliberately NOT returned from this module and are never persisted.
        out.push({
          source: "google_places",
          placeId: place.id ?? null,
          name: place.displayName?.text ?? null,
          featureType: place.types?.[0] ?? null,
          address: place.shortFormattedAddress ?? null,
          fullAddress: place.formattedAddress ?? null,
          city: params.canonical.city,
          locality: params.canonical.locality,
          province: params.canonical.province,
          categories: Array.isArray(place.types) ? place.types.slice(0, 8) : [],
          distanceFromFocusKm: distance,
          lat: Number.isFinite(lat) ? Number(lat) : null,
          lng: Number.isFinite(lng) ? Number(lng) : null,
        });
        if (out.length >= 8) return out;
      }
    } catch (error) {
      console.warn("RoutePro Google Places Evidence request skipped:", error);
    }
  }
  return out;
}

function toMapboxEvidence(feature: SearchBoxFeature, canonical: CanonicalInput): RouteProPoiEvidence {
  const p = feature.properties;
  const c = p?.context;
  return {
    source: "mapbox_searchbox",
    placeId: null,
    name: p?.name_preferred ?? p?.name ?? null,
    featureType: p?.feature_type ?? null,
    address: p?.address ?? c?.address?.name ?? ([c?.address?.address_number, c?.address?.street_name].filter(Boolean).join(" ") || null),
    fullAddress: p?.full_address ?? null,
    city: c?.place?.name ?? canonical.city,
    locality: c?.locality?.name ?? c?.neighborhood?.name ?? canonical.locality,
    province: c?.district?.name ?? c?.region?.name ?? canonical.province,
    categories: Array.isArray(p?.poi_category) ? p!.poi_category!.slice(0, 6) : [],
    distanceFromFocusKm: null,
    lat: null,
    lng: null,
  };
}

async function searchMapboxPlaces(params: {
  address: string;
  canonical: CanonicalInput;
  focusPoint?: FocusPoint | null;
}): Promise<RouteProPoiEvidence[]> {
  let token: string;
  try { token = getRouteProNdwMapboxAccessToken(); }
  catch (error) { console.warn("RoutePro AI Resolver: Mapbox Search Box unavailable.", error); return []; }

  const seen = new Set<string>();
  const evidence: RouteProPoiEvidence[] = [];
  for (const query of buildPlaceQueries(params.address, params.canonical)) {
    const url = new URL("https://api.mapbox.com/search/searchbox/v1/forward");
    url.searchParams.set("q", query);
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", params.canonical.countryCode || "IT");
    url.searchParams.set("language", "it");
    url.searchParams.set("limit", "5");
    url.searchParams.set("types", "poi,address,street,place,locality");
    url.searchParams.set("exclude_fields", "photos,reviews");
    if (params.focusPoint) url.searchParams.set("proximity", `${params.focusPoint.lng},${params.focusPoint.lat}`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url.toString(), { method: "GET", headers: { Accept: "application/geo+json, application/json" }, cache: "no-store", signal: controller.signal }).finally(() => clearTimeout(timeout));
      if (!response.ok) { console.warn("RoutePro AI Resolver Search Box error:", response.status); continue; }
      const json = (await response.json()) as SearchBoxResponse;
      for (const feature of json.features ?? []) {
        const item = toMapboxEvidence(feature, params.canonical);
        const key = normalizeComparable([item.name, item.address, item.fullAddress, item.city].filter(Boolean).join("|"));
        if (!key || seen.has(key)) continue;
        seen.add(key); evidence.push(item);
        if (evidence.length >= 8) return evidence;
      }
    } catch (error) { console.warn("RoutePro AI Resolver Search Box request skipped:", error); }
  }
  return evidence;
}


function normalizeHouseNumber(value: string | null | undefined): string {
  return normalizeComparable(value).replace(/\s+/g, "");
}

function streetIdentity(value: string | null | undefined): string {
  return normalizeComparable(value)
    .replace(/^(via|viale|vicolo|piazza|piazzale|corso|strada|largo|localita)\s+/, "")
    .trim();
}

function extractStreetAndHouseFromGoogleEvidence(evidence: RouteProPoiEvidence): {
  street: string | null;
  houseNumber: string | null;
} {
  const text = (evidence.fullAddress ?? evidence.address ?? evidence.name ?? "").trim();
  const first = text.split(",")[0]?.trim() ?? text;
  const match = first.match(/^(.*?)[,\s]+(\d{1,5}(?:\s*[A-Za-z]|\/[A-Za-z0-9]+)?)$/i);
  if (match) return { street: match[1]?.trim() || null, houseNumber: match[2]?.trim() || null };

  // Google often returns displayName like "Via Artigiani, 3" while the
  // formatted address carries the same information. Try the name explicitly.
  const name = (evidence.name ?? "").trim();
  const nameMatch = name.match(/^(.*?)[,\s]+(\d{1,5}(?:\s*[A-Za-z]|\/[A-Za-z0-9]+)?)$/i);
  if (nameMatch) return { street: nameMatch[1]?.trim() || null, houseNumber: nameMatch[2]?.trim() || null };
  return { street: null, houseNumber: null };
}

function findGoogleExactAddressRescue(params: {
  canonical: CanonicalInput;
  evidence: RouteProPoiEvidence[];
  focusPoint?: FocusPoint | null;
}): RouteProAiAddressResolverResult["googleExactAddressRescue"] {
  const wantedStreet = streetIdentity(params.canonical.streetName);
  const wantedHouse = normalizeHouseNumber(params.canonical.houseNumber);
  const wantedCity = normalizeComparable(params.canonical.city);

  if (!wantedStreet || !wantedHouse || !wantedCity) return null;

  for (const item of params.evidence) {
    if (item.source !== "google_places" || !item.placeId || item.lat === null || item.lng === null) continue;

    const parsed = extractStreetAndHouseFromGoogleEvidence(item);
    const itemStreet = streetIdentity(parsed.street);
    const itemHouse = normalizeHouseNumber(parsed.houseNumber);
    const allText = normalizeComparable([item.name, item.address, item.fullAddress].filter(Boolean).join(" "));

    const streetExact = itemStreet === wantedStreet || allText.includes(wantedStreet);
    const houseExact = itemHouse === wantedHouse || new RegExp(`(?:^|\\s)${wantedHouse.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|\\s)`).test(allText);
    const cityExact = allText.includes(wantedCity);
    const distanceOk = item.distanceFromFocusKm === null || item.distanceFromFocusKm <= 120;

    if (!streetExact || !houseExact || !cityExact || !distanceOk) continue;

    const expiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString();
    return { placeId: item.placeId, lat: item.lat, lng: item.lng, confidence: 0.99, expiresAt };
  }

  return null;
}


const RURAL_TOPONYM_PREFIX = /^(cascina|localita|borgo|contrada|podere|masseria|frazione|case)\s+/;

function ruralToponymCore(value: string | null | undefined): string {
  return normalizeComparable(value).replace(RURAL_TOPONYM_PREFIX, "").trim();
}

function isRuralToponym(value: string | null | undefined): boolean {
  return RURAL_TOPONYM_PREFIX.test(normalizeComparable(value));
}

function haveConservativeToponymSimilarity(a: string, b: string): boolean {
  if (!a || !b || a === b) return false;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length < 5 || longer.length - shorter.length > 6) return false;
  if (longer.startsWith(shorter)) return true;

  let common = 0;
  const limit = Math.min(a.length, b.length);
  while (common < limit && a[common] === b[common]) common += 1;
  return common >= 5 && common / Math.min(a.length, b.length) >= 0.8;
}

function googleEvidenceSupportsResolvedToponym(params: {
  evidence: RouteProPoiEvidence[];
  resolvedStreet: string;
  city: string;
  mapboxPoint: FocusPoint;
}): { item: RouteProPoiEvidence; distanceKm: number } | null {
  const resolvedIdentity = normalizeComparable(params.resolvedStreet);
  const resolvedCore = ruralToponymCore(params.resolvedStreet);
  const wantedCity = normalizeComparable(params.city);

  for (const item of params.evidence) {
    if (
      item.source !== "google_places" ||
      !item.placeId ||
      item.lat === null ||
      item.lng === null
    ) continue;

    const allText = normalizeComparable(
      [item.name, item.address, item.fullAddress].filter(Boolean).join(" "),
    );
    if (!allText || !allText.includes(wantedCity)) continue;

    const nameIdentity = normalizeComparable(item.name);
    const nameCore = ruralToponymCore(item.name);
    const identitySupported =
      allText.includes(resolvedIdentity) ||
      nameIdentity === resolvedIdentity ||
      (resolvedCore.length >= 5 && nameCore === resolvedCore);

    if (!identitySupported) continue;

    const providerDistanceKm = distanceKm(params.mapboxPoint, {
      lat: item.lat,
      lng: item.lng,
    });

    // Tight enough to mean the two providers are describing the same rural
    // compound/entrance, but tolerant of provider pin-placement differences.
    if (providerDistanceKm <= 0.75) {
      return { item, distanceKm: providerDistanceKm };
    }
  }

  return null;
}

function findToponymConsensusRescue(params: {
  canonical: CanonicalInput;
  rejectedCandidates: RejectedCandidate[];
  evidence: RouteProPoiEvidence[];
}): RouteProAiAddressResolverResult["toponymConsensusRescue"] {
  const originalStreet = params.canonical.streetName?.trim() ?? "";
  const wantedHouse = normalizeHouseNumber(params.canonical.houseNumber);
  const wantedCity = normalizeComparable(params.canonical.city);
  const originalCore = ruralToponymCore(originalStreet);

  if (
    !isRuralToponym(originalStreet) ||
    !wantedHouse ||
    !wantedCity ||
    originalCore.length < 5
  ) return null;

  for (const candidate of params.rejectedCandidates) {
    if (
      candidate.provider !== "mapbox" ||
      candidate.layer !== "address" ||
      candidate.lat === null ||
      candidate.lng === null ||
      !candidate.street ||
      !candidate.label
    ) continue;

    const candidateHouse = normalizeHouseNumber(candidate.houseNumber);
    const candidateCity = normalizeComparable(candidate.city);
    const candidateCore = ruralToponymCore(candidate.street);

    const houseExact = candidateHouse === wantedHouse;
    const cityExact = candidateCity === wantedCity;
    const ruralTypeCompatible = isRuralToponym(candidate.street);
    const nameVariantPlausible = haveConservativeToponymSimilarity(
      originalCore,
      candidateCore,
    );
    const candidateStrongEnough = candidate.score >= 50;

    if (
      !houseExact ||
      !cityExact ||
      !ruralTypeCompatible ||
      !nameVariantPlausible ||
      !candidateStrongEnough
    ) continue;

    const googleConsensus = googleEvidenceSupportsResolvedToponym({
      evidence: params.evidence,
      resolvedStreet: candidate.street,
      city: params.canonical.city ?? "",
      mapboxPoint: { lat: candidate.lat, lng: candidate.lng },
    });

    if (!googleConsensus) continue;

    return {
      lat: candidate.lat,
      lng: candidate.lng,
      label: candidate.label,
      confidence: 0.96,
      originalIdentity: originalStreet,
      resolvedIdentity: candidate.street,
      googlePlaceId: googleConsensus.item.placeId!,
      consensusDistanceKm: googleConsensus.distanceKm,
    };
  }

  return null;
}

function safeParseResolverJson(text: string): {
  classification?: RouteProAiAddressResolverResult["classification"];
  confidence?: number;
  queries?: string[];
  reason?: string;
} {
  return JSON.parse(text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim());
}

function evidenceExplicitlySupportsQuery(query: string, evidence: RouteProPoiEvidence[]): boolean {
  const q = normalizeComparable(query);
  return evidence.some((e) => {
    const joined = normalizeComparable([e.name, e.address, e.fullAddress, e.city, e.locality, e.province].filter(Boolean).join(" "));
    return joined && q.split(" ").filter((t) => t.length >= 4).filter((t) => !/^\d+$/.test(t)).every((t) => joined.includes(t));
  });
}

function identityGuard(params: {
  originalAddress: string;
  query: string;
  evidence: RouteProPoiEvidence[];
}): { allowed: boolean; reason: string } {
  const originalIdentity = coreIdentity(params.originalAddress);
  const proposedIdentity = coreIdentity(params.query);
  if (!originalIdentity || !proposedIdentity) return { allowed: false, reason: "missing_identity" };
  if (proposedIdentity.includes(originalIdentity) || originalIdentity.includes(proposedIdentity)) {
    return { allowed: true, reason: "identity_preserved" };
  }

  // A renamed identity may pass only when an external provider explicitly supports
  // the complete proposed query. Similar spelling alone is NEVER enough.
  if (evidenceExplicitlySupportsQuery(params.query, params.evidence)) {
    return { allowed: true, reason: "external_evidence_explicitly_supports_renamed_identity" };
  }
  return { allowed: false, reason: `identity_changed:${originalIdentity}->${proposedIdentity}` };
}

function sanitizeAndGuardQueries(queries: unknown, originalAddress: string, evidence: RouteProPoiEvidence[]) {
  if (!Array.isArray(queries)) return { accepted: [] as string[], rejected: [] as Array<{ query: string; reason: string }> };
  const original = normalizeComparable(originalAddress);
  const accepted: string[] = [];
  const rejected: Array<{ query: string; reason: string }> = [];
  const seen = new Set<string>();

  for (const raw of queries) {
    if (typeof raw !== "string") continue;
    const query = raw.replace(/\s+/g, " ").trim();
    const normalized = normalizeComparable(query);
    if (query.length < 4 || query.length > 256 || normalized === original || seen.has(normalized)) continue;
    seen.add(normalized);
    const guard = identityGuard({ originalAddress, query, evidence });
    if (guard.allowed) accepted.push(query); else rejected.push({ query, reason: guard.reason });
    if (accepted.length >= 3) break;
  }
  return { accepted, rejected };
}

export async function resolveRouteProAddressWithAi(params: {
  address: string;
  canonical: CanonicalInput;
  focusPoint?: FocusPoint | null;
  rejectedCandidates: RejectedCandidate[];
}): Promise<RouteProAiAddressResolverResult> {
  const [mapboxEvidence, initialGoogleEvidence] = await Promise.all([
    searchMapboxPlaces(params),
    process.env.NDW_ROUTEPRO_GOOGLE_PLACES_EVIDENCE === "true" ? searchGooglePlaces(params) : Promise.resolve([]),
  ]);

  // v2.2.1 — Toponym targeted verification.
  // The broad Google search is intentionally conservative. When it does not
  // surface the alternate rural name already returned by permanent Mapbox,
  // explicitly verify ONLY strong rejected Mapbox candidates (same civic +
  // same municipality + conservative rural-name variant). This does not make
  // the candidate valid by itself: findToponymConsensusRescue still requires
  // Google identity support and <= 750 m geographic convergence.
  let googleEvidence = [...initialGoogleEvidence];

  const mergeGoogleEvidence = (items: RouteProPoiEvidence[]) => {
    const seen = new Set(
      googleEvidence.map((item) =>
        item.placeId ?? normalizeComparable([item.name, item.address, item.fullAddress].filter(Boolean).join("|")),
      ),
    );
    for (const item of items) {
      const key = item.placeId ?? normalizeComparable([item.name, item.address, item.fullAddress].filter(Boolean).join("|"));
      if (!key || seen.has(key)) continue;
      seen.add(key);
      googleEvidence.push(item);
    }
  };

  const googleExactAddressRescue = findGoogleExactAddressRescue({
    canonical: params.canonical,
    evidence: googleEvidence,
    focusPoint: params.focusPoint,
  });

  let toponymConsensusRescue = googleExactAddressRescue
    ? null
    : findToponymConsensusRescue({
        canonical: params.canonical,
        rejectedCandidates: params.rejectedCandidates,
        evidence: googleEvidence,
      });

  if (
    !googleExactAddressRescue &&
    !toponymConsensusRescue &&
    process.env.NDW_ROUTEPRO_GOOGLE_PLACES_EVIDENCE === "true" &&
    isRuralToponym(params.canonical.streetName)
  ) {
    const wantedHouse = normalizeHouseNumber(params.canonical.houseNumber);
    const wantedCity = normalizeComparable(params.canonical.city);
    const originalCore = ruralToponymCore(params.canonical.streetName);

    const verificationCandidates = params.rejectedCandidates
      .filter((candidate) => {
        if (candidate.provider !== "mapbox" || candidate.layer !== "address" || !candidate.street || !candidate.city) return false;
        if (normalizeHouseNumber(candidate.houseNumber) !== wantedHouse) return false;
        if (normalizeComparable(candidate.city) !== wantedCity) return false;
        if (!isRuralToponym(candidate.street)) return false;
        return haveConservativeToponymSimilarity(originalCore, ruralToponymCore(candidate.street));
      })
      .slice(0, 2);

    for (const candidate of verificationCandidates) {
      const verificationAddress = [
        candidate.street,
        candidate.houseNumber,
        candidate.city,
        candidate.province,
        "Italia",
      ].filter(Boolean).join(", ");

      console.info("RoutePro Toponym Targeted Google Verification:", {
        originalAddress: params.address,
        candidate: candidate.label,
        verificationAddress,
      });

      const targetedEvidence = await searchGooglePlaces({
        address: verificationAddress,
        canonical: {
          ...params.canonical,
          streetName: candidate.street,
          houseNumber: candidate.houseNumber,
          city: candidate.city,
          province: candidate.province ?? params.canonical.province,
        },
        focusPoint: params.focusPoint,
      });

      mergeGoogleEvidence(targetedEvidence);

      toponymConsensusRescue = findToponymConsensusRescue({
        canonical: params.canonical,
        rejectedCandidates: params.rejectedCandidates,
        evidence: googleEvidence,
      });

      if (toponymConsensusRescue) break;
    }
  }

  const poiEvidence = [...googleEvidence, ...mapboxEvidence].slice(0, 18);

  if (googleExactAddressRescue) {
    console.info("RoutePro Google Exact Address Rescue candidate:", {
      address: params.address,
      placeId: googleExactAddressRescue.placeId,
      confidence: googleExactAddressRescue.confidence,
      expiresAt: googleExactAddressRescue.expiresAt,
    });
  }

  if (toponymConsensusRescue) {
    console.info("RoutePro Toponym Consensus Rescue candidate:", {
      address: params.address,
      originalIdentity: toponymConsensusRescue.originalIdentity,
      resolvedIdentity: toponymConsensusRescue.resolvedIdentity,
      consensusDistanceKm: toponymConsensusRescue.consensusDistanceKm,
      googlePlaceId: toponymConsensusRescue.googlePlaceId,
    });
  }

  console.info("RoutePro Resolver external evidence:", {
    address: params.address,
    googleEvidenceCount: googleEvidence.length,
    mapboxEvidenceCount: mapboxEvidence.length,
    google: googleEvidence.slice(0, 4).map((e) => ({ placeId: e.placeId, name: e.name, address: e.fullAddress ?? e.address, distanceFromFocusKm: e.distanceFromFocusKm })),
  });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { version: ROUTEPRO_AI_ADDRESS_RESOLVER_VERSION, classification: "unknown", confidence: 0, queries: [], rejectedQueries: [], reason: "OPENAI_API_KEY non configurata: resolver AI saltato.", poiEvidence, googleExactAddressRescue, toponymConsensusRescue };

  const client = new OpenAI({ apiKey });
  const prompt = `
You are RoutePro Evidence Resolver V2.
You do NOT geocode and NEVER invent coordinates.
Use the unresolved delivery address, rejected geocoder candidates, Mapbox place evidence and Google Places evidence to propose at most 3 TEXT queries for another permanent geocoder pass.

Return ONLY JSON:
{"classification":"address|named_place|poi|complex|locality|possible_typo|unknown","confidence":0.0,"queries":[],"reason":""}

Hard rules:
- Google/Mapbox external evidence is evidence, not permission to guess.
- Preserve the identity of the original named place/street. Do NOT rename "Cascina Costa" to "Cascina Costaiola" merely because it is nearby or similarly named.
- You MAY enrich "Cascina Costa" with a street/locality only if evidence explicitly associates Cascina Costa itself with that context.
- Preserve house number unless evidence explicitly shows it is an internal/unit number and not a street civic number.
- For a normal address such as "Via Artigiani 3", if Google evidence confirms an activity at exactly that civic number, state that in reason and propose only queries supported by that exact evidence.
- Never output latitude/longitude or Place IDs in queries.
- If evidence conflicts or only suggests a similar nearby place, return queries: [].
- A later Identity Guard AND the normal RoutePro Quality Gate must approve any query.

INPUT:\n${JSON.stringify({ address: params.address, canonical: params.canonical, rejectedCandidates: params.rejectedCandidates.slice(0, 8), externalEvidence: poiEvidence.slice(0, 12) }, null, 2)}
`;

  try {
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: [{ role: "user", content: prompt }] });
    const parsed = safeParseResolverJson(response.output_text);
    const allowed = new Set<RouteProAiAddressResolverResult["classification"]>(["address","named_place","poi","complex","locality","possible_typo","unknown"]);
    const classification = parsed.classification && allowed.has(parsed.classification) ? parsed.classification : "unknown";
    const confidence = typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : 0;
    const guarded = confidence >= 0.78 ? sanitizeAndGuardQueries(parsed.queries, params.address, poiEvidence) : { accepted: [] as string[], rejected: [] as Array<{ query: string; reason: string }> };

    for (const item of guarded.rejected) {
      console.warn("RoutePro Resolver Identity Guard rejected query:", { originalAddress: params.address, proposedQuery: item.query, reason: item.reason });
    }

    return {
      version: ROUTEPRO_AI_ADDRESS_RESOLVER_VERSION,
      classification,
      confidence,
      queries: guarded.accepted,
      rejectedQueries: guarded.rejected,
      reason: typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim().slice(0, 700) : "Nessuna motivazione disponibile.",
      poiEvidence,
      googleExactAddressRescue,
      toponymConsensusRescue,
    };
  } catch (error) {
    console.error("RoutePro AI Address Resolver OpenAI error:", error);
    return { version: ROUTEPRO_AI_ADDRESS_RESOLVER_VERSION, classification: "unknown", confidence: 0, queries: [], rejectedQueries: [], reason: "Resolver AI non disponibile; mantieni review manuale.", poiEvidence, googleExactAddressRescue, toponymConsensusRescue };
  }
}
