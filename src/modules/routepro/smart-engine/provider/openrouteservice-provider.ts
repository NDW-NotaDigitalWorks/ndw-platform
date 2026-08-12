/**
 * RPSE-004B — OpenRouteService Provider v1
 *
 * Translates OpenRouteService/Pelias geocoding responses into the unified
 * RoutePro provider format used by provider-adapter.ts.
 */

import { getRouteProNdwOrsApiKey } from "@/modules/routepro/server/routepro.ai-config";
import type {
  RouteProProviderExecutor,
  RouteProProviderRequestResult,
  RouteProProviderCandidate,
} from "@/modules/routepro/smart-engine/provider/provider-adapter";

export const ROUTEPRO_ORS_PROVIDER_VERSION = "1.0.0";

export type RouteProOrsFocusPoint = {
  lat: number;
  lng: number;
};

export type RouteProOrsProviderOptions = {
  focusPoint?: RouteProOrsFocusPoint | null;
  countryCode?: string;
  size?: number;
};

type OrsFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    id?: string;
    gid?: string;
    confidence?: number;
    label?: string;
    layer?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    locality?: string;
    localadmin?: string;
    county?: string;
    region?: string;
    postalcode?: string;
    country?: string;
    country_a?: string;
  };
};

type OrsGeocodeResponse = {
  features?: OrsFeature[];
};

function isValidFocusPoint(
  focusPoint: RouteProOrsFocusPoint | null | undefined,
): focusPoint is RouteProOrsFocusPoint {
  return Boolean(
    focusPoint &&
      Number.isFinite(focusPoint.lat) &&
      Number.isFinite(focusPoint.lng),
  );
}

function clampSize(size: number | undefined): number {
  if (!Number.isFinite(size)) {
    return 10;
  }

  return Math.max(1, Math.min(20, Math.round(Number(size))));
}

function toCandidate(
  feature: OrsFeature,
): RouteProProviderCandidate | null {
  const coordinates = feature.geometry?.coordinates;

  if (!coordinates) {
    return null;
  }

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const properties = feature.properties;

  return {
    provider: "openrouteservice",
    providerCandidateId:
      properties?.gid ?? properties?.id ?? null,
    label: properties?.label ?? properties?.name ?? null,
    lat,
    lng,
    confidence:
      typeof properties?.confidence === "number" &&
      Number.isFinite(properties.confidence)
        ? properties.confidence
        : null,
    layer: properties?.layer ?? null,
    street: properties?.street ?? null,
    houseNumber: properties?.housenumber ?? null,
    locality: properties?.locality ?? null,
    city:
      properties?.localadmin ??
      properties?.locality ??
      null,
    province: properties?.county ?? null,
    postalCode: properties?.postalcode ?? null,
    region: properties?.region ?? null,
    country: properties?.country ?? null,
    countryCode: properties?.country_a ?? null,
    raw: feature,
  };
}

function mapHttpFailure(
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
    message: `OpenRouteService error: ${status}`,
  };
}

export function createOpenRouteServiceProviderExecutor(
  options: RouteProOrsProviderOptions = {},
): RouteProProviderExecutor {
  const countryCode =
    options.countryCode?.trim().toUpperCase() || "IT";
  const size = clampSize(options.size);

  return async ({
    query,
    signal,
  }): Promise<RouteProProviderRequestResult> => {
    let apiKey: string;

    try {
      apiKey = getRouteProNdwOrsApiKey();
    } catch (error) {
      console.error(
        "RoutePro ORS provider key error:",
        error,
      );

      return {
        ok: false,
        status: null,
        retryable: false,
        message:
          "RoutePro geocoding is not configured on NDW.",
      };
    }

    const url = new URL(
      "https://api.openrouteservice.org/geocode/search",
    );

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("text", query);
    url.searchParams.set("size", String(size));
    url.searchParams.set("boundary.country", countryCode);

    if (isValidFocusPoint(options.focusPoint)) {
      url.searchParams.set(
        "focus.point.lat",
        String(options.focusPoint.lat),
      );
      url.searchParams.set(
        "focus.point.lon",
        String(options.focusPoint.lng),
      );
    }

    let response: Response;

    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal,
      });
    } catch (error) {
      const aborted =
        signal.aborted ||
        (error instanceof DOMException &&
          error.name === "AbortError");

      return {
        ok: false,
        status: null,
        retryable: true,
        message: aborted
          ? "OpenRouteService request timed out."
          : error instanceof Error
            ? error.message
            : "OpenRouteService request failed.",
      };
    }

    if (!response.ok) {
      return mapHttpFailure(response.status);
    }

    let json: OrsGeocodeResponse;

    try {
      json = (await response.json()) as OrsGeocodeResponse;
    } catch {
      return {
        ok: false,
        status: response.status,
        retryable: true,
        message:
          "OpenRouteService returned an invalid JSON response.",
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