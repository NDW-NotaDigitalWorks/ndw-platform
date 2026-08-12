/**
 * RPSE-007 — Mapbox Geocoding Provider v1
 */

import { getRouteProNdwMapboxAccessToken } from "@/modules/routepro/server/routepro.ai-config";
import type {
  RouteProProviderCandidate,
  RouteProProviderExecutor,
  RouteProProviderRequestResult,
} from "@/modules/routepro/smart-engine/provider/provider-adapter";

export const ROUTEPRO_MAPBOX_PROVIDER_VERSION = "1.0.0";

export type RouteProMapboxFocusPoint = {
  lat: number;
  lng: number;
};

export type RouteProMapboxProviderOptions = {
  focusPoint?: RouteProMapboxFocusPoint | null;
  countryCode?: string;
  language?: string;
  limit?: number;
  permanent?: boolean;
};

type ContextItem = {
  name?: string;
  street_name?: string;
  address_number?: string;
  country_code?: string;
  country_code_alpha_3?: string;
};

type MapboxFeature = {
  id?: string;
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    mapbox_id?: string;
    feature_type?: string;
    name?: string;
    name_preferred?: string;
    place_formatted?: string;
    full_address?: string;
    coordinates?: {
      longitude?: number;
      latitude?: number;
      accuracy?: string;
      routable_points?: Array<{
        name?: string;
        longitude?: number;
        latitude?: number;
      }>;
    };
    context?: {
      address?: ContextItem;
      street?: ContextItem;
      neighborhood?: ContextItem;
      locality?: ContextItem;
      place?: ContextItem;
      district?: ContextItem;
      postcode?: ContextItem;
      region?: ContextItem;
      country?: ContextItem;
    };
    match_code?: {
      confidence?: "exact" | "high" | "medium" | "low";
    };
  };
};

type MapboxResponse = {
  features?: MapboxFeature[];
};

function isValidFocusPoint(
  value: RouteProMapboxFocusPoint | null | undefined,
): value is RouteProMapboxFocusPoint {
  return Boolean(
    value &&
      Number.isFinite(value.lat) &&
      Number.isFinite(value.lng),
  );
}

function confidenceFromFeature(feature: MapboxFeature): number | null {
  const matchConfidence = feature.properties?.match_code?.confidence;

  const matchScore =
    matchConfidence === "exact"
      ? 1
      : matchConfidence === "high"
        ? 0.9
        : matchConfidence === "medium"
          ? 0.7
          : matchConfidence === "low"
            ? 0.45
            : null;

  const accuracy = feature.properties?.coordinates?.accuracy;

  const accuracyScore =
    accuracy === "rooftop"
      ? 0.98
      : accuracy === "parcel"
        ? 0.95
        : accuracy === "point"
          ? 0.92
          : accuracy === "interpolated"
            ? 0.78
            : accuracy === "approximate"
              ? 0.55
              : accuracy === "intersection"
                ? 0.7
                : null;

  if (matchScore !== null && accuracyScore !== null) {
    return Math.min(matchScore, accuracyScore);
  }

  return matchScore ?? accuracyScore;
}

function chooseCoordinates(
  feature: MapboxFeature,
): [number, number] | null {
  const routablePoint =
    feature.properties?.coordinates?.routable_points?.find(
      (point) =>
        point.name === "default" &&
        Number.isFinite(point.longitude) &&
        Number.isFinite(point.latitude),
    );

  if (
    routablePoint &&
    typeof routablePoint.longitude === "number" &&
    typeof routablePoint.latitude === "number"
  ) {
    return [routablePoint.longitude, routablePoint.latitude];
  }

  const longitude = feature.properties?.coordinates?.longitude;
  const latitude = feature.properties?.coordinates?.latitude;

  if (
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude)
  ) {
    return [longitude, latitude];
  }

  return feature.geometry?.coordinates ?? null;
}

function toCandidate(
  feature: MapboxFeature,
): RouteProProviderCandidate | null {
  const coordinates = chooseCoordinates(feature);

  if (!coordinates) return null;

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const properties = feature.properties;
  const context = properties?.context;
  const featureType = properties?.feature_type ?? null;

  return {
    provider: "mapbox",
    providerCandidateId:
      properties?.mapbox_id ?? feature.id ?? null,
    label:
  properties?.full_address ??
  (
    [
      properties?.name_preferred ?? properties?.name,
      properties?.place_formatted,
    ]
      .filter(Boolean)
      .join(", ") || null
  ),
    lat,
    lng,
    confidence: confidenceFromFeature(feature),
    layer: featureType,
    street:
      context?.address?.street_name ??
      context?.street?.name ??
      (featureType === "street"
        ? properties?.name_preferred ?? properties?.name ?? null
        : null),
    houseNumber: context?.address?.address_number ?? null,
    locality:
      context?.locality?.name ??
      context?.neighborhood?.name ??
      null,
    city: context?.place?.name ?? null,
    province:
      context?.district?.name ??
      context?.region?.name ??
      null,
    postalCode: context?.postcode?.name ?? null,
    region: context?.region?.name ?? null,
    country: context?.country?.name ?? null,
    countryCode:
      context?.country?.country_code ??
      context?.country?.country_code_alpha_3 ??
      null,
    raw: feature,
  };
}

function mapFailure(
  status: number,
): RouteProProviderRequestResult {
  return {
    ok: false,
    status,
    retryable:
      status === 408 ||
      status === 425 ||
      status === 429 ||
      status >= 500,
    message: `Mapbox Geocoding error: ${status}`,
  };
}

export function createMapboxProviderExecutor(
  options: RouteProMapboxProviderOptions = {},
): RouteProProviderExecutor {
  const countryCode =
    options.countryCode?.trim().toUpperCase() || "IT";
  const language = options.language?.trim() || "it";
  const limit = Math.max(
    1,
    Math.min(10, Math.round(options.limit ?? 10)),
  );
  const permanent = options.permanent ?? false;

  return async ({ query, signal }) => {
    let token: string;

    try {
      token = getRouteProNdwMapboxAccessToken();
    } catch (error) {
      console.error("RoutePro Mapbox token error:", error);

      return {
        ok: false,
        status: null,
        retryable: false,
        message:
          "RoutePro Mapbox geocoding is not configured on NDW.",
      };
    }

    const url = new URL(
      "https://api.mapbox.com/search/geocode/v6/forward",
    );

    url.searchParams.set("q", query);
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", countryCode);
    url.searchParams.set("language", language);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set(
      "types",
      "address,street,place,locality,postcode",
    );
    url.searchParams.set("autocomplete", "false");
    url.searchParams.set(
      "permanent",
      permanent ? "true" : "false",
    );

    if (isValidFocusPoint(options.focusPoint)) {
      url.searchParams.set(
        "proximity",
        `${options.focusPoint.lng},${options.focusPoint.lat}`,
      );
    }

    let response: Response;

    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/geo+json, application/json",
        },
        cache: "no-store",
        signal,
      });
    } catch (error) {
      return {
        ok: false,
        status: null,
        retryable: true,
        message:
          signal.aborted
            ? "Mapbox request timed out."
            : error instanceof Error
              ? error.message
              : "Mapbox request failed.",
      };
    }

    if (!response.ok) {
      return mapFailure(response.status);
    }

    let json: MapboxResponse;

    try {
      json = (await response.json()) as MapboxResponse;
    } catch {
      return {
        ok: false,
        status: response.status,
        retryable: true,
        message: "Mapbox returned invalid JSON.",
      };
    }

    const candidates = (json.features ?? [])
      .map(toCandidate)
      .filter(
        (
          candidate,
        ): candidate is RouteProProviderCandidate =>
          candidate !== null,
      );

    return {
      ok: true,
      status: response.status,
      candidates,
    };
  };
}