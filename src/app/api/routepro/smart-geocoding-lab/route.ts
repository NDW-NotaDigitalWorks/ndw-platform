import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  runRouteProSmartGeocodingLab,
  type RouteProSmartGeocodingLabProvider,
} from "@/modules/routepro/smart-engine/testing/smart-geocoding-lab";

export const runtime = "nodejs";

type SmartGeocodingLabPayload = {
  address?: string;
  provider?: RouteProSmartGeocodingLabProvider;
  context?: {
    dominantLocality?: string | null;
    dominantProvince?: string | null;
    dominantPostalCode?: string | null;
    countryCode?: string | null;
    countryName?: string | null;
  };
  focusPoint?: {
    lat?: number;
    lng?: number;
  } | null;
};

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSupportedProvider(
  value: unknown,
): value is RouteProSmartGeocodingLabProvider {
  return value === "openrouteservice" || value === "mapbox";
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, message: "Authentication required." },
      { status: 401 },
    );
  }

  let body: SmartGeocodingLabPayload;

  try {
    body = (await request.json()) as SmartGeocodingLabPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const address = body.address?.trim() ?? "";

  if (!address) {
    return NextResponse.json(
      { ok: false, message: "Address is required." },
      { status: 400 },
    );
  }

  const provider = isSupportedProvider(body.provider)
    ? body.provider
    : "openrouteservice";

  const focusPoint =
    body.focusPoint &&
    isFiniteCoordinate(body.focusPoint.lat) &&
    isFiniteCoordinate(body.focusPoint.lng)
      ? {
          lat: body.focusPoint.lat,
          lng: body.focusPoint.lng,
        }
      : null;

  try {
    const result = await runRouteProSmartGeocodingLab({
      address,
      provider,
      context: body.context,
      focusPoint,
      countryCode: body.context?.countryCode ?? "IT",
    });

    return NextResponse.json({
      ok: true,
      result: {
        version: result.version,
        providerName: result.providerName,
        canonical: result.canonical,
        provider: result.provider,
        ranking: result.ranking,
        selectedCandidate: result.selectedCandidate,
      },
    });
  } catch (error) {
    console.error("RoutePro Smart Geocoding Lab error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Smart geocoding lab failed.",
      },
      { status: 500 },
    );
  }
}