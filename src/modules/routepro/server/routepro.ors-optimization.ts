import { getRouteProNdwOrsApiKey } from "@/modules/routepro/server/routepro.ai-config";

export type RouteProOrsOptimizationStop = {
  id: string;
  lat: number;
  lng: number;
};

export type RouteProOrsOptimizationPoint = {
  lat: number;
  lng: number;
};

export type RouteProOrsOptimizationResult =
  | {
      ok: true;
      orderedStopIds: string[];
      provider: "openrouteservice_optimization";
      distanceMeters: number | null;
      durationSeconds: number | null;
    }
  | {
      ok: false;
      reason: "missing_key" | "provider_error" | "invalid_response";
      message: string;
      provider: "openrouteservice_optimization";
    };

type OrsOptimizationJob = {
  id: number;
  location: [number, number];
};

type OrsOptimizationVehicle = {
  id: number;
  profile: "driving-car";
  start?: [number, number];
  end?: [number, number];
};

type OrsOptimizationStep = {
  type?: string;
  job?: number;
  distance?: number;
  duration?: number;
};

type OrsOptimizationRoute = {
  distance?: number;
  duration?: number;
  steps?: OrsOptimizationStep[];
};

type OrsOptimizationResponse = {
  routes?: OrsOptimizationRoute[];
  error?: {
    message?: string;
  };
};

export async function optimizeStopsWithOpenRouteService(
  stops: RouteProOrsOptimizationStop[],
  startPoint?: RouteProOrsOptimizationPoint | null,
  endPoint?: RouteProOrsOptimizationPoint | null,
): Promise<RouteProOrsOptimizationResult> {
  let apiKey: string;

  try {
    apiKey = getRouteProNdwOrsApiKey();
  } catch (error) {
    console.error("RoutePro NDW ORS optimization key error:", error);

    return {
      ok: false,
      reason: "missing_key",
      message: "RoutePro optimization is not configured on NDW.",
      provider: "openrouteservice_optimization",
    };
  }

  if (stops.length < 2) {
    return {
      ok: false,
      reason: "invalid_response",
      message: "At least 2 delivery stops are required for ORS optimization.",
      provider: "openrouteservice_optimization",
    };
  }

  const jobs: OrsOptimizationJob[] = stops.map((stop, index) => ({
    id: index + 1,
    location: [stop.lng, stop.lat],
  }));

  const jobIdToStopId = new Map<number, string>();

  stops.forEach((stop, index) => {
    jobIdToStopId.set(index + 1, stop.id);
  });

  const vehicle: OrsOptimizationVehicle = {
    id: 1,
    profile: "driving-car",
  };

  if (startPoint) {
    vehicle.start = [startPoint.lng, startPoint.lat];
  }

  if (endPoint) {
    vehicle.end = [endPoint.lng, endPoint.lat];
  }

  try {
    const response = await fetch(
      "https://api.openrouteservice.org/optimization",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          jobs,
          vehicles: [vehicle],
        }),
      },
    );

    if (!response.ok) {
      const responseText = await response.text();

      console.error(
        "RoutePro ORS optimization provider error:",
        response.status,
        responseText,
      );

      return {
        ok: false,
        reason: "provider_error",
        message: `OpenRouteService optimization error: ${response.status}`,
        provider: "openrouteservice_optimization",
      };
    }

    const json = (await response.json()) as OrsOptimizationResponse;

    if (json.error?.message) {
      return {
        ok: false,
        reason: "provider_error",
        message: json.error.message,
        provider: "openrouteservice_optimization",
      };
    }

    const route = json.routes?.[0];

    if (!route?.steps || route.steps.length === 0) {
      return {
        ok: false,
        reason: "invalid_response",
        message: "OpenRouteService returned no optimization steps.",
        provider: "openrouteservice_optimization",
      };
    }

    const orderedStopIds = route.steps
      .filter((step) => step.type === "job" && typeof step.job === "number")
      .map((step) => jobIdToStopId.get(Number(step.job)))
      .filter((stopId): stopId is string => Boolean(stopId));

    if (orderedStopIds.length !== stops.length) {
      console.error(
        "RoutePro ORS optimization returned an incomplete job sequence:",
        {
          expectedStops: stops.length,
          returnedStops: orderedStopIds.length,
        },
      );

      return {
        ok: false,
        reason: "invalid_response",
        message:
          "OpenRouteService returned an incomplete optimized stop sequence.",
        provider: "openrouteservice_optimization",
      };
    }

    return {
      ok: true,
      orderedStopIds,
      provider: "openrouteservice_optimization",
      distanceMeters: route.distance ?? null,
      durationSeconds: route.duration ?? null,
    };
  } catch (error) {
    console.error("RoutePro ORS optimization error:", error);

    return {
      ok: false,
      reason: "provider_error",
      message: "OpenRouteService optimization request failed.",
      provider: "openrouteservice_optimization",
    };
  }
}