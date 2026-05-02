import { createClient } from "@/lib/supabase/server";
import { decryptRouteProSecret } from "@/modules/routepro/server/routepro.crypto";

type OrsFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    confidence?: number;
    label?: string;
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

  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("text", address);
  url.searchParams.set("size", "1");

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
    const first = json.features?.[0];

    const coordinates = first?.geometry?.coordinates;

    if (!coordinates) {
      return {
        ok: false,
        reason: "not_found",
        message: "No geocoding result found.",
        provider: "openrouteservice",
      };
    }

    const [lng, lat] = coordinates;

    return {
      ok: true,
      lat,
      lng,
      label: first?.properties?.label ?? null,
      confidence: first?.properties?.confidence ?? null,
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