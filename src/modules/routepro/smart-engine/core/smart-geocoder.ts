/**
 * RPSE-011A / RPSE-012C — Smart Geocoder Facade v1.1
 *
 * Single public entry point for RoutePro geocoding.
 * Adds optional per-stop telemetry without changing geocoding decisions.
 */

import {
  canonicalizeRouteProAddress,
  type RouteProCanonicalizerContext,
  type RouteProCanonicalizerKnowledge,
  type RouteProCanonicalAddress,
} from "@/modules/routepro/smart-engine/address/address-canonicalizer";
import {
  rankRouteProCandidates,
  type RouteProCandidateQualityResult,
} from "@/modules/routepro/smart-engine/decision/candidate-quality";
import {
  runRouteProProviderAdapter,
  type RouteProProviderAdapterResult,
  type RouteProProviderName,
} from "@/modules/routepro/smart-engine/provider/provider-adapter";
import {
  createMapboxProviderExecutor,
  type RouteProMapboxFocusPoint,
} from "@/modules/routepro/smart-engine/provider/mapbox-provider";
import {
  createOpenRouteServiceProviderExecutor,
} from "@/modules/routepro/smart-engine/provider/openrouteservice-provider";
import type {
  SmartUsageTracker,
  SmartProvider,
  SmartResult,
} from "@/modules/routepro/smart-engine/telemetry/usage-tracker";

export const ROUTEPRO_SMART_GEOCODER_VERSION = "1.3.0";

export type RouteProSmartGeocoderMode =
  | "laboratory"
  | "production";

export type RouteProSmartGeocoderStatus =
  | "success"
  | "review_required"
  | "provider_error";

export type RouteProSmartGeocoderProviderRun = {
  provider: RouteProProviderName;
  providerResult: RouteProProviderAdapterResult;
  ranking: RouteProCandidateQualityResult[];
  accepted: RouteProCandidateQualityResult | null;
};

export type RouteProSmartGeocoderResult = {
  version: string;
  status: RouteProSmartGeocoderStatus;
  canonical: RouteProCanonicalAddress;
  lat: number | null;
  lng: number | null;
  label: string | null;
  provider: RouteProProviderName | null;
  providerConfidence: number | null;
  qualityScore: number | null;
  decision: RouteProCandidateQualityResult["decision"] | null;
  requiresReview: boolean;
  fallbackUsed: boolean;
  totalDurationMs: number;
  providerRuns: RouteProSmartGeocoderProviderRun[];
  message: string;
};

export type RouteProSmartGeocodeInput = {
  address: string;
  context?: RouteProCanonicalizerContext;
  knowledge?: RouteProCanonicalizerKnowledge;
  focusPoint?: RouteProMapboxFocusPoint | null;
  countryCode?: string;
  mode?: RouteProSmartGeocoderMode;

  /**
   * Optional route/batch-scoped tracker.
   * One call to smartGeocodeAddress adds exactly one stop entry.
   */
  usageTracker?: SmartUsageTracker;
};

function getAcceptedCandidate(
  ranking: RouteProCandidateQualityResult[],
): RouteProCandidateQualityResult | null {
  return ranking.find((candidate) => candidate.usableAsStopCoordinate) ?? null;
}

function countProviderRequests(
  providerRuns: RouteProSmartGeocoderProviderRun[],
  provider: RouteProProviderName,
): number {
  return providerRuns
    .filter((run) => run.provider === provider)
    .reduce(
      (sum, run) => sum + run.providerResult.traces.length,
      0,
    );
}

function recordUsage(params: {
  tracker?: SmartUsageTracker;
  providerRuns: RouteProSmartGeocoderProviderRun[];
  durationMs: number;
  finalProvider: RouteProProviderName | null;
  confidence: number | null;
  fallbackUsed: boolean;
  requiresReview: boolean;
}): void {
  if (!params.tracker) return;

  let provider: SmartProvider = "none";

  if (params.finalProvider === "mapbox") {
    provider = "mapbox";
  } else if (params.finalProvider === "openrouteservice") {
    provider = "ors";
  } else if (params.requiresReview) {
    provider = "manual";
  }

  let result: SmartResult = "success";

  if (params.requiresReview) {
    result = "review";
  } else if (params.fallbackUsed) {
    result = "fallback";
  }

  params.tracker.add({
    provider,
    durationMs: params.durationMs,
    confidence: params.confidence,
    result,
    cacheHit: false,
    mapboxRequests: countProviderRequests(
      params.providerRuns,
      "mapbox",
    ),
    orsRequests: countProviderRequests(
      params.providerRuns,
      "openrouteservice",
    ),
  });
}

async function runMapbox(params: {
  canonical: RouteProCanonicalAddress;
  focusPoint?: RouteProMapboxFocusPoint | null;
  countryCode: string;
  mode: RouteProSmartGeocoderMode;
}): Promise<RouteProSmartGeocoderProviderRun> {
  const queries = params.canonical.providerQueries.slice(0, 6);

  const combinedCandidates: RouteProProviderAdapterResult["candidates"] = [];
  const combinedTraces: RouteProProviderAdapterResult["traces"] = [];
  const attemptedQueries: string[] = [];

  let successfulQuery: string | null = null;
  let totalDurationMs = 0;
  let totalAttempts = 0;
  let rateLimitedAttempts = 0;
  let timeoutAttempts = 0;
  let lastError: string | null = null;

  const seenCandidateKeys = new Set<string>();

  for (const query of queries) {
    const providerResult = await runRouteProProviderAdapter({
      provider: "mapbox",
      queries: [query],
      execute: createMapboxProviderExecutor({
        focusPoint: params.focusPoint,
        countryCode: params.countryCode,
        language: "it",
        limit: 10,
        permanent: params.mode === "production",
      }),
      options: {
        timeoutMs: 8_000,
        maxAttemptsPerQuery: 3,
        initialBackoffMs: 700,
        maxBackoffMs: 4_000,
        stopOnFirstCandidateSet: true,
        maxQueries: 1,
      },
    });

    attemptedQueries.push(...providerResult.attemptedQueries);
    combinedTraces.push(...providerResult.traces);
    totalDurationMs += providerResult.totalDurationMs;
    totalAttempts += providerResult.totalAttempts;
    rateLimitedAttempts += providerResult.rateLimitedAttempts;
    timeoutAttempts += providerResult.timeoutAttempts;
    lastError = providerResult.error;

    if (providerResult.successfulQuery && !successfulQuery) {
      successfulQuery = providerResult.successfulQuery;
    }

    for (const candidate of providerResult.candidates) {
      const key = [
        candidate.provider,
        candidate.providerCandidateId ?? "",
        candidate.lat.toFixed(7),
        candidate.lng.toFixed(7),
        candidate.label ?? "",
      ].join("|");

      if (seenCandidateKeys.has(key)) continue;

      seenCandidateKeys.add(key);
      combinedCandidates.push(candidate);
    }

    const ranking = rankRouteProCandidates({
      canonical: params.canonical,
      candidates: combinedCandidates,
    });

    const accepted = getAcceptedCandidate(ranking);

    if (accepted) {
      return {
        provider: "mapbox",
        providerResult: {
          version: providerResult.version,
          ok: true,
          provider: "mapbox",
          candidates: combinedCandidates,
          successfulQuery,
          attemptedQueries,
          traces: combinedTraces,
          totalDurationMs,
          totalAttempts,
          rateLimitedAttempts,
          timeoutAttempts,
          error: null,
        },
        ranking,
        accepted,
      };
    }
  }

  const ranking = rankRouteProCandidates({
    canonical: params.canonical,
    candidates: combinedCandidates,
  });

  return {
    provider: "mapbox",
    providerResult: {
      version: "1.0.0",
      ok: combinedCandidates.length > 0,
      provider: "mapbox",
      candidates: combinedCandidates,
      successfulQuery,
      attemptedQueries,
      traces: combinedTraces,
      totalDurationMs,
      totalAttempts,
      rateLimitedAttempts,
      timeoutAttempts,
      error:
        combinedCandidates.length > 0
          ? null
          : lastError ?? "No Mapbox candidates found.",
    },
    ranking,
    accepted: getAcceptedCandidate(ranking),
  };
}

async function runOpenRouteService(params: {
  canonical: RouteProCanonicalAddress;
  focusPoint?: RouteProMapboxFocusPoint | null;
  countryCode: string;
}): Promise<RouteProSmartGeocoderProviderRun> {
  const providerResult = await runRouteProProviderAdapter({
    provider: "openrouteservice",
    queries: params.canonical.providerQueries,
    execute: createOpenRouteServiceProviderExecutor({
      focusPoint: params.focusPoint,
      countryCode: params.countryCode,
      size: 10,
    }),
    options: {
      timeoutMs: 8_000,
      maxAttemptsPerQuery: 3,
      initialBackoffMs: 700,
      maxBackoffMs: 4_000,
      stopOnFirstCandidateSet: true,
      maxQueries: 6,
    },
  });

  const ranking = rankRouteProCandidates({
    canonical: params.canonical,
    candidates: providerResult.candidates,
  });

  return {
    provider: "openrouteservice",
    providerResult,
    ranking,
    accepted: getAcceptedCandidate(ranking),
  };
}

function buildSuccessResult(params: {
  canonical: RouteProCanonicalAddress;
  run: RouteProSmartGeocoderProviderRun;
  providerRuns: RouteProSmartGeocoderProviderRun[];
  fallbackUsed: boolean;
  startedAt: number;
}): RouteProSmartGeocoderResult {
  const accepted = params.run.accepted;

  if (!accepted) {
    throw new Error(
      "buildSuccessResult called without an accepted candidate.",
    );
  }

  return {
    version: ROUTEPRO_SMART_GEOCODER_VERSION,
    status: "success",
    canonical: params.canonical,
    lat: accepted.candidate.lat,
    lng: accepted.candidate.lng,
    label: accepted.candidate.label,
    provider: accepted.candidate.provider,
    providerConfidence: accepted.candidate.confidence,
    qualityScore: accepted.score,
    decision: accepted.decision,
    requiresReview: false,
    fallbackUsed: params.fallbackUsed,
    totalDurationMs: Date.now() - params.startedAt,
    providerRuns: params.providerRuns,
    message: params.fallbackUsed
      ? "Indirizzo geocodificato dal provider di fallback."
      : "Indirizzo geocodificato dal provider principale.",
  };
}

export async function smartGeocodeAddress(
  input: RouteProSmartGeocodeInput,
): Promise<RouteProSmartGeocoderResult> {
  const startedAt = Date.now();

  const canonical = canonicalizeRouteProAddress(input.address, {
    context: input.context,
    knowledge: input.knowledge,
  });

  if (!canonical.raw.trim()) {
    const result: RouteProSmartGeocoderResult = {
      version: ROUTEPRO_SMART_GEOCODER_VERSION,
      status: "review_required",
      canonical,
      lat: null,
      lng: null,
      label: null,
      provider: null,
      providerConfidence: null,
      qualityScore: null,
      decision: null,
      requiresReview: true,
      fallbackUsed: false,
      totalDurationMs: Date.now() - startedAt,
      providerRuns: [],
      message: "Indirizzo vuoto.",
    };

    recordUsage({
      tracker: input.usageTracker,
      providerRuns: result.providerRuns,
      durationMs: result.totalDurationMs,
      finalProvider: result.provider,
      confidence: result.providerConfidence,
      fallbackUsed: result.fallbackUsed,
      requiresReview: result.requiresReview,
    });

    return result;
  }

  const countryCode =
    input.countryCode ?? canonical.countryCode ?? "IT";
  const mode = input.mode ?? "laboratory";
  const providerRuns: RouteProSmartGeocoderProviderRun[] = [];

  const mapboxRun = await runMapbox({
    canonical,
    focusPoint: input.focusPoint,
    countryCode,
    mode,
  });

  providerRuns.push(mapboxRun);

  if (mapboxRun.accepted) {
    const result = buildSuccessResult({
      canonical,
      run: mapboxRun,
      providerRuns,
      fallbackUsed: false,
      startedAt,
    });

    recordUsage({
      tracker: input.usageTracker,
      providerRuns: result.providerRuns,
      durationMs: result.totalDurationMs,
      finalProvider: result.provider,
      confidence: result.providerConfidence,
      fallbackUsed: result.fallbackUsed,
      requiresReview: result.requiresReview,
    });

    return result;
  }

  const orsRun = await runOpenRouteService({
    canonical,
    focusPoint: input.focusPoint,
    countryCode,
  });

  providerRuns.push(orsRun);

  if (orsRun.accepted) {
    const result = buildSuccessResult({
      canonical,
      run: orsRun,
      providerRuns,
      fallbackUsed: true,
      startedAt,
    });

    recordUsage({
      tracker: input.usageTracker,
      providerRuns: result.providerRuns,
      durationMs: result.totalDurationMs,
      finalProvider: result.provider,
      confidence: result.providerConfidence,
      fallbackUsed: result.fallbackUsed,
      requiresReview: result.requiresReview,
    });

    return result;
  }

  const allProviderRequestsFailed = providerRuns.every(
    (run) => !run.providerResult.ok,
  );

  const result: RouteProSmartGeocoderResult = {
    version: ROUTEPRO_SMART_GEOCODER_VERSION,
    status: allProviderRequestsFailed
      ? "provider_error"
      : "review_required",
    canonical,
    lat: null,
    lng: null,
    label: null,
    provider: null,
    providerConfidence: null,
    qualityScore: null,
    decision: null,
    requiresReview: true,
    fallbackUsed: true,
    totalDurationMs: Date.now() - startedAt,
    providerRuns,
    message: allProviderRequestsFailed
      ? "Nessun provider di geocoding ha risposto correttamente."
      : "Nessun candidato ha superato il Quality Gate RoutePro.",
  };

  recordUsage({
    tracker: input.usageTracker,
    providerRuns: result.providerRuns,
    durationMs: result.totalDurationMs,
    finalProvider: result.provider,
    confidence: result.providerConfidence,
    fallbackUsed: result.fallbackUsed,
    requiresReview: result.requiresReview,
  });

  return result;
}