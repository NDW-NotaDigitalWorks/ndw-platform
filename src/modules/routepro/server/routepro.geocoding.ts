import { createClient } from "@/lib/supabase/server";
import { getRouteProNdwOrsApiKey } from "@/modules/routepro/server/routepro.ai-config";

type OrsFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    confidence?: number;
    label?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    postalcode?: string;
    locality?: string;
    localadmin?: string;
    county?: string;
    region?: string;
    country?: string;
    country_a?: string;
    layer?: string;
  };
};

type OrsGeocodeResponse = {
  features?: OrsFeature[];
};

export type RouteProGeocodeFocusPoint = {
  lat: number;
  lng: number;
};

export type RouteProGeocodeOptions = {
  focusPoint?: RouteProGeocodeFocusPoint | null;
  maxDistanceKm?: number | null;
  bypassCache?: boolean;
};

export type RouteProGeocodeResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      label: string | null;
      confidence: number | null;
      provider: "openrouteservice" | "routepro_cache";
    }
  | {
      ok: false;
      reason: "missing_key" | "not_found" | "provider_error";
      message: string;
      provider: "openrouteservice";
    };

type GeocodingCountryConfig = {
  countryCode: string;
  bounds: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
};

type GeocodingCacheRow = {
  normalized_address: string;
  display_address: string;
  lat: number;
  lng: number;
  confidence: number | null;
};

type ScoredFeature = {
  feature: OrsFeature;
  score: number;
  distanceFromFocusKm: number | null;
};

const DEFAULT_GEOCODING_COUNTRY: GeocodingCountryConfig = {
  countryCode: "IT",
  bounds: {
    minLng: 6.0,
    minLat: 35.0,
    maxLng: 19.0,
    maxLat: 47.5,
  },
};

const MIN_PROVIDER_CONFIDENCE = 0.25;
const MIN_ACCEPTED_CANDIDATE_SCORE = 44;
const MIN_ACCEPTED_CACHE_SCORE = 48;

const ADDRESS_STOP_WORDS = new Set([
  "via",
  "viale",
  "vicolo",
  "piazza",
  "piazzale",
  "corso",
  "strada",
  "localita",
  "località",
  "frazione",
  "italia",
  "italy",
  "it",
  "provincia",
  "comune",
  "di",
  "del",
  "della",
  "dei",
  "degli",
  "delle",
]);

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  first: RouteProGeocodeFocusPoint,
  second: RouteProGeocodeFocusPoint,
): number {
  const earthRadiusKm = 6371;

  const dLat = toRadians(second.lat - first.lat);
  const dLng = toRadians(second.lng - first.lng);

  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const value =
    sinLat * sinLat +
    Math.cos(firstLat) * Math.cos(secondLat) * sinLng * sinLng;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)))
  );
}

function isValidFocusPoint(
  focusPoint: RouteProGeocodeFocusPoint | null | undefined,
): focusPoint is RouteProGeocodeFocusPoint {
  return Boolean(
    focusPoint &&
      Number.isFinite(focusPoint.lat) &&
      Number.isFinite(focusPoint.lng),
  );
}

function isInsideCountryBounds(
  lat: number,
  lng: number,
  config: GeocodingCountryConfig,
): boolean {
  return (
    lng >= config.bounds.minLng &&
    lng <= config.bounds.maxLng &&
    lat >= config.bounds.minLat &&
    lat <= config.bounds.maxLat
  );
}

function normalizeComparableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/["']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAddressForGeocoding(address: string): string {
  return address.replaceAll('"', "").replace(/\s+/g, " ").trim();
}

function normalizeAddressForCache(address: string): string {
  return normalizeComparableText(normalizeAddressForGeocoding(address));
}

function tokenizeAddress(value: string): string[] {
  return normalizeComparableText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 0 &&
        !ADDRESS_STOP_WORDS.has(token),
    );
}

function getTokenWeight(token: string): number {
  if (/^\d+[a-z]?$/.test(token)) {
    return 4;
  }

  if (token.length === 2) {
    return 2.5;
  }

  if (token.length >= 8) {
    return 2;
  }

  return 1;
}

function extractHouseNumber(value: string): string | null {
  const normalized = normalizeComparableText(value);
  const match = normalized.match(/\b(\d{1,5}[a-z]?)\b/);
  return match?.[1] ?? null;
}

function getFeatureSearchText(feature: OrsFeature): string {
  const properties = feature.properties;

  return [
    properties?.label,
    properties?.name,
    properties?.housenumber,
    properties?.street,
    properties?.postalcode,
    properties?.locality,
    properties?.localadmin,
    properties?.county,
    properties?.region,
    properties?.country,
    properties?.country_a,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");
}

function getFeatureLayerQuality(feature: OrsFeature): number {
  switch ((feature.properties?.layer ?? "").toLowerCase()) {
    case "address":
      return 10;
    case "venue":
      return 7;
    case "street":
      return 4;
    case "locality":
    case "localadmin":
    case "county":
    case "region":
      return -10;
    default:
      return 0;
  }
}

function isLikelyItalyResult(feature: OrsFeature): boolean {
  const country = feature.properties?.country?.toLowerCase() ?? "";
  const countryCode = feature.properties?.country_a?.toLowerCase() ?? "";

  return (
    country.includes("ital") ||
    countryCode === "ita" ||
    countryCode === "it"
  );
}

function calculateTextMatchScore(
  queryAddress: string,
  candidateText: string,
): number {
  const queryTokens = tokenizeAddress(queryAddress);
  const candidateTokens = new Set(tokenizeAddress(candidateText));

  if (queryTokens.length === 0 || candidateTokens.size === 0) {
    return 0;
  }

  let matchedWeight = 0;
  let totalWeight = 0;

  for (const token of queryTokens) {
    const weight = getTokenWeight(token);
    totalWeight += weight;

    if (candidateTokens.has(token)) {
      matchedWeight += weight;
      continue;
    }

    const partialMatch = Array.from(candidateTokens).some(
      (candidateToken) =>
        token.length >= 5 &&
        candidateToken.length >= 5 &&
        (candidateToken.startsWith(token) ||
          token.startsWith(candidateToken)),
    );

    if (partialMatch) {
      matchedWeight += weight * 0.65;
    }
  }

  if (totalWeight <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, matchedWeight / totalWeight));
}

function calculateCandidateScore(params: {
  feature: OrsFeature;
  queryAddress: string;
  focusPoint?: RouteProGeocodeFocusPoint | null;
  maxDistanceKm?: number | null;
}): ScoredFeature | null {
  const coordinates = params.feature.geometry?.coordinates;

  if (!coordinates) {
    return null;
  }

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (
    !isInsideCountryBounds(
      lat,
      lng,
      DEFAULT_GEOCODING_COUNTRY,
    ) ||
    !isLikelyItalyResult(params.feature)
  ) {
    return null;
  }

  const rawProviderConfidence =
    params.feature.properties?.confidence;

  const providerConfidence =
    typeof rawProviderConfidence === "number" &&
    Number.isFinite(rawProviderConfidence)
      ? rawProviderConfidence
      : 0.7;

  if (
    typeof rawProviderConfidence === "number" &&
    rawProviderConfidence < MIN_PROVIDER_CONFIDENCE
  ) {
    return null;
  }

  const featureText = getFeatureSearchText(params.feature);
  const textMatch = calculateTextMatchScore(
    params.queryAddress,
    featureText,
  );

  const requestedHouseNumber = extractHouseNumber(params.queryAddress);
  const candidateHouseNumber =
    params.feature.properties?.housenumber?.toLowerCase() ??
    extractHouseNumber(featureText);

  let houseNumberAdjustment = 0;

  if (requestedHouseNumber) {
    if (candidateHouseNumber === requestedHouseNumber) {
      houseNumberAdjustment = 10;
    } else if (candidateHouseNumber) {
      houseNumberAdjustment = -6;
    } else {
      houseNumberAdjustment = -2;
    }
  }

  let distanceFromFocusKm: number | null = null;
  let focusAdjustment = 0;

  if (isValidFocusPoint(params.focusPoint)) {
    distanceFromFocusKm = getDistanceKm(params.focusPoint, {
      lat,
      lng,
    });

    if (
      Number.isFinite(params.maxDistanceKm) &&
      Number(params.maxDistanceKm) > 0 &&
      distanceFromFocusKm > Number(params.maxDistanceKm)
    ) {
      return null;
    }

    if (distanceFromFocusKm <= 3) {
      focusAdjustment = 18;
    } else if (distanceFromFocusKm <= 10) {
      focusAdjustment = 14;
    } else if (distanceFromFocusKm <= 25) {
      focusAdjustment = 8;
    } else if (distanceFromFocusKm <= 50) {
      focusAdjustment = 2;
    } else if (distanceFromFocusKm <= 100) {
      focusAdjustment = -8;
    } else {
      focusAdjustment = -22;
    }
  }

  const score =
    providerConfidence * 32 +
    textMatch * 48 +
    houseNumberAdjustment +
    focusAdjustment +
    getFeatureLayerQuality(params.feature);

  return {
    feature: params.feature,
    score,
    distanceFromFocusKm,
  };
}

function selectBestFeature(params: {
  features: OrsFeature[];
  queryAddress: string;
  focusPoint?: RouteProGeocodeFocusPoint | null;
  maxDistanceKm?: number | null;
}): ScoredFeature | null {
  const scoredCandidates = params.features
    .map((feature) =>
      calculateCandidateScore({
        feature,
        queryAddress: params.queryAddress,
        focusPoint: params.focusPoint,
        maxDistanceKm: params.maxDistanceKm,
      }),
    )
    .filter((candidate): candidate is ScoredFeature => Boolean(candidate))
    .sort((first, second) => second.score - first.score);

  const bestCandidate = scoredCandidates[0];

  if (!bestCandidate || bestCandidate.score < MIN_ACCEPTED_CANDIDATE_SCORE) {
    return null;
  }

  const secondCandidate = scoredCandidates[1];

  if (
    secondCandidate &&
    bestCandidate.score < 55 &&
    bestCandidate.score - secondCandidate.score < 1.5
  ) {
    return null;
  }

  return bestCandidate;
}

function validateCachedResult(params: {
  row: GeocodingCacheRow;
  queryAddress: string;
  focusPoint?: RouteProGeocodeFocusPoint | null;
  maxDistanceKm?: number | null;
}): boolean {
  const pseudoFeature: OrsFeature = {
    geometry: {
      coordinates: [Number(params.row.lng), Number(params.row.lat)],
    },
    properties: {
      confidence: params.row.confidence ?? 0.7,
      label: params.row.display_address,
      country: "Italia",
      country_a: "IT",
      layer: "address",
    },
  };

  const scored = calculateCandidateScore({
    feature: pseudoFeature,
    queryAddress: params.queryAddress,
    focusPoint: params.focusPoint,
    maxDistanceKm: params.maxDistanceKm,
  });

  return Boolean(scored && scored.score >= MIN_ACCEPTED_CACHE_SCORE);
}

async function getCachedGeocode(
  normalizedAddress: string,
  cleanAddress: string,
  options: RouteProGeocodeOptions,
): Promise<RouteProGeocodeResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routepro_geocoding_cache")
    .select("normalized_address, display_address, lat, lng, confidence")
    .eq("normalized_address", normalizedAddress)
    .maybeSingle<GeocodingCacheRow>();

  if (error) {
    console.error("RoutePro geocoding cache read error:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  if (
    !validateCachedResult({
      row: data,
      queryAddress: cleanAddress,
      focusPoint: options.focusPoint,
      maxDistanceKm: options.maxDistanceKm,
    })
  ) {
    console.warn(
      "RoutePro ignored a suspicious cached geocode:",
      normalizedAddress,
    );
    return null;
  }

  await supabase.rpc("increment_routepro_geocoding_cache_hit", {
    cache_key: normalizedAddress,
  }).then(({ error: rpcError }) => {
    if (rpcError) {
      console.warn("RoutePro cache hit increment skipped:", rpcError.message);
    }
  });

  await supabase
    .from("routepro_geocoding_cache")
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("normalized_address", normalizedAddress);

  return {
    ok: true,
    lat: Number(data.lat),
    lng: Number(data.lng),
    label: data.display_address,
    confidence: data.confidence,
    provider: "routepro_cache",
  };
}

async function saveGeocodeToCache(params: {
  normalizedAddress: string;
  displayAddress: string;
  lat: number;
  lng: number;
  confidence: number | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("routepro_geocoding_cache").upsert(
    {
      normalized_address: params.normalizedAddress,
      display_address: params.displayAddress,
      lat: params.lat,
      lng: params.lng,
      provider: "openrouteservice",
      confidence: params.confidence,
      country_code: "IT",
      hit_count: 0,
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "normalized_address" },
  );

  if (error) {
    console.error("RoutePro geocoding cache save error:", error.message);
  }
}


function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function addItalyContext(address: string): string {
  const normalized = normalizeComparableText(address);

  if (
    normalized.endsWith(" it") ||
    normalized.includes(" italia") ||
    normalized.includes(" italy")
  ) {
    return address;
  }

  return `${address}, Italia`;
}

function normalizeComplexHouseNumbers(address: string): string {
  return address
    .replace(/\b(\d{1,5})\s*\/\s*([a-zA-Z])\b/g, "$1 $2")
    .replace(/\b(\d{1,5})([a-zA-Z])\b/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function useFirstNumberFromRange(address: string): string {
  return address
    .replace(/\b(\d{1,5})\s*\/\s*(\d{1,5})\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function removeHouseNumberFromAddress(address: string): string {
  const parts = address.split(",");
  const streetPart = parts[0]?.trim() ?? "";

  const streetWithoutHouseNumber = streetPart
    .replace(/\b\d{1,5}\s*\/\s*\d{1,5}\b/g, "")
    .replace(/\b\d{1,5}\s*\/\s*[a-zA-Z]\b/g, "")
    .replace(/\b\d{1,5}[a-zA-Z]?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return [streetWithoutHouseNumber, ...parts.slice(1)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function ensureStreetPrefix(address: string): string {
  const parts = address.split(",");
  const firstPart = parts[0]?.trim() ?? "";

  if (
    /^(via|viale|vicolo|piazza|piazzale|corso|strada|largo|localita|località)\b/i.test(
      firstPart,
    )
  ) {
    return address;
  }

  if (!/[a-zA-ZÀ-ÿ]/.test(firstPart)) {
    return address;
  }

  return [`Via ${firstPart}`, ...parts.slice(1)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function buildGeocodingQueries(cleanAddress: string): string[] {
  const normalizedHouseNumber = normalizeComplexHouseNumbers(cleanAddress);
  const rangeSimplified = useFirstNumberFromRange(normalizedHouseNumber);
  const withStreetPrefix = ensureStreetPrefix(rangeSimplified);
  const streetOnly = removeHouseNumberFromAddress(withStreetPrefix);

  return Array.from(
    new Set(
      [
        cleanAddress,
        normalizedHouseNumber,
        rangeSimplified,
        withStreetPrefix,
        streetOnly,
      ]
        .map((query) => addItalyContext(query))
        .map((query) => query.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  );
}

type OrsRequestResult =
  | {
      ok: true;
      features: OrsFeature[];
    }
  | {
      ok: false;
      status: number | null;
      message: string;
    };

async function requestOrsCandidates(params: {
  apiKey: string;
  queryText: string;
  focusPoint?: RouteProGeocodeFocusPoint | null;
}): Promise<OrsRequestResult> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const url = new URL("https://api.openrouteservice.org/geocode/search");
    url.searchParams.set("api_key", params.apiKey);
    url.searchParams.set("text", params.queryText);
    url.searchParams.set("size", "10");
    url.searchParams.set(
      "boundary.country",
      DEFAULT_GEOCODING_COUNTRY.countryCode,
    );

    if (isValidFocusPoint(params.focusPoint)) {
      url.searchParams.set(
        "focus.point.lat",
        String(params.focusPoint.lat),
      );
      url.searchParams.set(
        "focus.point.lon",
        String(params.focusPoint.lng),
      );
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const json = (await response.json()) as OrsGeocodeResponse;

      return {
        ok: true,
        features: json.features ?? [],
      };
    }

    if (response.status === 429 && attempt < maxAttempts - 1) {
      await sleep(900 * 2 ** attempt);
      continue;
    }

    return {
      ok: false,
      status: response.status,
      message: `OpenRouteService error: ${response.status}`,
    };
  }

  return {
    ok: false,
    status: 429,
    message: "OpenRouteService error: 429",
  };
}

export async function geocodeAddressWithOpenRouteService(
  address: string,
  options: RouteProGeocodeOptions = {},
): Promise<RouteProGeocodeResult> {
  const cleanAddress = normalizeAddressForGeocoding(address);
  const normalizedAddress = normalizeAddressForCache(cleanAddress);

  if (!normalizedAddress) {
    return {
      ok: false,
      reason: "not_found",
      message: "Address is empty.",
      provider: "openrouteservice",
    };
  }

  if (!options.bypassCache) {
    const cachedResult = await getCachedGeocode(
      normalizedAddress,
      cleanAddress,
      options,
    );

    if (cachedResult) {
      return cachedResult;
    }
  }

  let apiKey: string;

  try {
    apiKey = getRouteProNdwOrsApiKey();
  } catch (error) {
    console.error("RoutePro NDW ORS geocoding key error:", error);

    return {
      ok: false,
      reason: "missing_key",
      message: "RoutePro geocoding is not configured on NDW.",
      provider: "openrouteservice",
    };
  }

  const queryVariants = buildGeocodingQueries(cleanAddress);
  let lastProviderError: string | null = null;

  try {
    for (const queryText of queryVariants) {
      const requestResult = await requestOrsCandidates({
        apiKey,
        queryText,
        focusPoint: options.focusPoint,
      });

      if (!requestResult.ok) {
        lastProviderError = requestResult.message;

        if (requestResult.status === 429) {
          break;
        }

        continue;
      }

      const selectedCandidate = selectBestFeature({
        features: requestResult.features,
        queryAddress: cleanAddress,
        focusPoint: options.focusPoint,
        maxDistanceKm: options.maxDistanceKm,
      });

      const coordinates =
        selectedCandidate?.feature.geometry?.coordinates;

      if (!selectedCandidate || !coordinates) {
        continue;
      }

      const [lng, lat] = coordinates;
      const label =
        selectedCandidate.feature.properties?.label ?? cleanAddress;
      const confidence =
        selectedCandidate.feature.properties?.confidence ?? null;

      await saveGeocodeToCache({
        normalizedAddress,
        displayAddress: label,
        lat,
        lng,
        confidence,
      });

      return {
        ok: true,
        lat,
        lng,
        label,
        confidence,
        provider: "openrouteservice",
      };
    }

    if (lastProviderError) {
      return {
        ok: false,
        reason: "provider_error",
        message: lastProviderError,
        provider: "openrouteservice",
      };
    }

    return {
      ok: false,
      reason: "not_found",
      message:
        "No reliable Italian geocoding result found. Please review the address.",
      provider: "openrouteservice",
    };
  } catch (error) {
    console.error("RoutePro ORS geocoding error:", error);

    return {
      ok: false,
      reason: "provider_error",
      message: "OpenRouteService request failed.",
      provider: "openrouteservice",
    };
  }
}