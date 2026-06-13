import { createClient } from "@/lib/supabase/server";
import { decryptRouteProSecret } from "@/modules/routepro/server/routepro.crypto";

type OrsFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    confidence?: number;
    label?: string;
    country?: string;
    country_a?: string;
  };
};

type OrsGeocodeResponse = {
  features?: OrsFeature[];
};

export type RouteProGeocodeResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      label: string | null;
      confidence: number | null;
      provider: "openrouteservice";
    }
  | {
      ok: false;
      reason: "missing_key" | "not_found" | "provider_error";
      message: string;
      provider: "openrouteservice";
    };

    type GeocodingCountryConfig = {
  countryCode: string;
  focusLat: string;
  focusLng: string;
  bounds: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
};

const DEFAULT_GEOCODING_COUNTRY: GeocodingCountryConfig = {
  countryCode: "IT",
  focusLat: "45.7",
  focusLng: "9.2",
  bounds: {
    minLng: 6.0,
    minLat: 35.0,
    maxLng: 19.0,
    maxLat: 47.5,
  },
};

async function getMyOpenRouteServiceKey(): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routepro_api_keys")
    .select("encrypted_key")
    .eq("provider", "openrouteservice")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("RoutePro ORS key fetch error:", error.message);
    return null;
  }

  return data?.encrypted_key ? decryptRouteProSecret(data.encrypted_key) : null;
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

function normalizeAddressForGeocoding(address: string): string {
  return address
    .replaceAll('"', "")
    .replace(/\s+/g, " ")
    .trim();
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

export async function geocodeAddressWithOpenRouteService(
  address: string,
): Promise<RouteProGeocodeResult> {
  const apiKey = await getMyOpenRouteServiceKey();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing_key",
      message: "Missing OpenRouteService API key.",
      provider: "openrouteservice",
    };
  }

  const cleanAddress = normalizeAddressForGeocoding(address);
  const countryConfig = DEFAULT_GEOCODING_COUNTRY;

  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("text", cleanAddress);
  url.searchParams.set("size", "5");

  url.searchParams.set("boundary.country", countryConfig.countryCode);
  url.searchParams.set("focus.point.lat", countryConfig.focusLat);
  url.searchParams.set("focus.point.lon", countryConfig.focusLng);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "provider_error",
        message: `OpenRouteService error: ${response.status}`,
        provider: "openrouteservice",
      };
    }

    const json = (await response.json()) as OrsGeocodeResponse;
    const features = json.features ?? [];

    const validFeature = features.find((feature) => {
      const coordinates = feature.geometry?.coordinates;

      if (!coordinates) return false;

      const [lng, lat] = coordinates;
      const confidence = feature.properties?.confidence ?? 0;

      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        isInsideCountryBounds(lat, lng, countryConfig) &&
        isLikelyItalyResult(feature) &&
        confidence >= 0.6
      );
    });

    if (!validFeature?.geometry?.coordinates) {
      return {
        ok: false,
        reason: "not_found",
        message:
          "No reliable Italian geocoding result found. Please review the address.",
        provider: "openrouteservice",
      };
    }

    const [lng, lat] = validFeature.geometry.coordinates;

    return {
      ok: true,
      lat,
      lng,
      label: validFeature.properties?.label ?? null,
      confidence: validFeature.properties?.confidence ?? null,
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