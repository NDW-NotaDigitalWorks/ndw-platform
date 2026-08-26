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
import { resolveRouteProAddressWithAi } from "@/modules/routepro/smart-engine/resolver/ai-address-resolver";

export const ROUTEPRO_SMART_GEOCODER_VERSION = "1.8.1-toponym-targeted-verification";

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
  provider: RouteProProviderName | "google_places" | null;
  providerConfidence: number | null;
  qualityScore: number | null;
  decision: RouteProCandidateQualityResult["decision"] | null;
  requiresReview: boolean;
  fallbackUsed: boolean;
  totalDurationMs: number;
  providerRuns: RouteProSmartGeocoderProviderRun[];
  message: string;
  coordinateExpiresAt?: string | null;
  googlePlaceId?: string | null;
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
  finalProvider: RouteProProviderName | "google_places" | null;
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

function normalizeComparableLocality(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sameComparableLocality(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  const left = normalizeComparableLocality(first);
  const right = normalizeComparableLocality(second);

  return Boolean(left && right && left === right);
}

function inferMunicipalityFromOrsReference(params: {
  canonical: RouteProCanonicalAddress;
  orsRun: RouteProSmartGeocoderProviderRun;
}): string | null {
  const requestedLocality =
    params.canonical.locality ?? params.canonical.city;

  if (!requestedLocality) return null;

  for (const ranked of params.orsRun.ranking) {
    const candidate = ranked.candidate;

    /*
     * Locality Rescue v1 is intentionally conservative.
     *
     * We only trust ORS as a locality -> municipality bridge when the
     * provider explicitly exposes the requested place in candidate.locality
     * and separately exposes a municipality in candidate.city.
     *
     * Example:
     *   requested: Perticato
     *   ORS locality: Perticato
     *   ORS city: Mariano Comense
     *
     * We do NOT infer from the human-readable label alone. This prevents
     * ambiguous cases such as a provider returning "Paina, Seregno" while
     * locality itself is not Paina.
     */
    if (
      !candidate.city ||
      !candidate.locality ||
      !sameComparableLocality(candidate.locality, requestedLocality) ||
      sameComparableLocality(candidate.city, requestedLocality)
    ) {
      continue;
    }

    const layer = normalizeComparableLocality(candidate.layer);

    if (
      layer !== "locality" &&
      layer !== "neighbourhood" &&
      layer !== "localadmin" &&
      layer !== "place"
    ) {
      continue;
    }

    return candidate.city.trim();
  }

  return null;
}

function buildLocalityRescueCanonical(params: {
  canonical: RouteProCanonicalAddress;
  municipality: string;
  knowledge?: RouteProCanonicalizerKnowledge;
}): RouteProCanonicalAddress | null {
  const streetWithNumber = params.canonical.canonicalStreet;

  if (!streetWithNumber?.trim()) return null;

  return canonicalizeRouteProAddress(
    `${streetWithNumber}, ${params.municipality}`,
    {
      knowledge: params.knowledge,
    },
  );
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

  /*
   * RPSE Locality Rescue v1
   *
   * When ORS explicitly identifies the requested locality as a locality
   * belonging to a different municipality, retry Mapbox with that municipality
   * while preserving the original street and house number.
   *
   * No locality or municipality is hardcoded.
   * If ORS cannot provide an explicit locality -> city relationship, or if
   * Mapbox still cannot pass the normal Quality Gate, the stop remains review.
   */
  const inferredMunicipality = inferMunicipalityFromOrsReference({
    canonical,
    orsRun,
  });

  if (inferredMunicipality) {
    const rescueCanonical = buildLocalityRescueCanonical({
      canonical,
      municipality: inferredMunicipality,
      knowledge: input.knowledge,
    });

    if (rescueCanonical) {
      console.info("RoutePro Locality Rescue attempt:", {
        address: input.address,
        requestedLocality: canonical.locality ?? canonical.city,
        inferredMunicipality,
        rescueQueries: rescueCanonical.providerQueries,
      });

      const rescueRun = await runMapbox({
        canonical: rescueCanonical,
        focusPoint: input.focusPoint,
        countryCode,
        mode,
      });

      providerRuns.push(rescueRun);

      if (rescueRun.accepted) {
        const result = buildSuccessResult({
          canonical,
          run: rescueRun,
          providerRuns,
          fallbackUsed: true,
          startedAt,
        });

        console.info("RoutePro Locality Rescue success:", {
          address: input.address,
          inferredMunicipality,
          provider: result.provider,
          qualityScore: result.qualityScore,
          label: result.label,
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

      console.warn("RoutePro Locality Rescue not accepted:", {
        address: input.address,
        inferredMunicipality,
      });
    }
  }

  /*
   * RoutePro AI Address Resolver v1
   *
   * Runs only after Mapbox + ORS + Locality Rescue have all failed the
   * existing Quality Gate. The resolver may use temporary Search Box POI
   * evidence and AI reasoning to propose alternative TEXT queries only.
   *
   * IMPORTANT: Search Box coordinates are never accepted or persisted here.
   * Every proposed query is sent back through the normal Mapbox/ORS provider
   * adapters and must pass the SAME RoutePro Quality Gate before success.
   */
  if (process.env.NDW_ROUTEPRO_AI_ADDRESS_RESOLVER === "true") {
    try {
      const resolverResult = await resolveRouteProAddressWithAi({
        address: input.address,
        canonical: {
          streetName: canonical.streetName,
          houseNumber: canonical.houseNumber,
          locality: canonical.locality,
          city: canonical.city,
          province: canonical.province,
          postalCode: canonical.postalCode,
          countryCode: canonical.countryCode,
        },
        focusPoint: input.focusPoint ?? null,
        rejectedCandidates: providerRuns.flatMap((run) =>
          run.ranking.slice(0, 3).map((ranked) => ({
            provider: run.provider,
            label: ranked.candidate.label,
            street: ranked.candidate.street,
            houseNumber: ranked.candidate.houseNumber,
            locality: ranked.candidate.locality,
            city: ranked.candidate.city,
            province: ranked.candidate.province,
            layer: ranked.candidate.layer,
            confidence: ranked.candidate.confidence,
            score: ranked.score,
            evidence: ranked.evidence.map((item) => item.code),
            lat: ranked.candidate.lat,
            lng: ranked.candidate.lng,
          })),
        ),
      });

      console.info("RoutePro AI Address Resolver result:", {
        address: input.address,
        classification: resolverResult.classification,
        confidence: resolverResult.confidence,
        queries: resolverResult.queries,
        poiEvidenceCount: resolverResult.poiEvidence.length,
        googleEvidenceCount: resolverResult.poiEvidence.filter((item) => item.source === "google_places").length,
        rejectedQueries: resolverResult.rejectedQueries,
        reason: resolverResult.reason,
      });

      /*
       * Google Exact Address Rescue
       *
       * Allowed only when Google Places evidence matches the ORIGINAL canonical
       * street + house number + city exactly and is geographically sane.
       * Google coordinates are TTL-limited under the EEA service terms and MUST
       * NOT be written to the permanent RoutePro geocode cache.
       */
      if (resolverResult.googleExactAddressRescue) {
        const rescue = resolverResult.googleExactAddressRescue;
        const result: RouteProSmartGeocoderResult = {
          version: ROUTEPRO_SMART_GEOCODER_VERSION,
          status: "success",
          canonical,
          lat: rescue.lat,
          lng: rescue.lng,
          // Persist the user-provided address, not Google formatted-address content.
          label: input.address,
          provider: "google_places",
          providerConfidence: rescue.confidence,
          qualityScore: 100,
          decision: null,
          requiresReview: false,
          fallbackUsed: true,
          totalDurationMs: Date.now() - startedAt,
          providerRuns,
          message: "Indirizzo confermato da Google Places con match esatto strada, civico e comune.",
          coordinateExpiresAt: rescue.expiresAt,
          googlePlaceId: rescue.placeId,
        };

        console.info("RoutePro Google Exact Address Rescue success:", {
          address: input.address,
          confidence: rescue.confidence,
          expiresAt: rescue.expiresAt,
          placeId: rescue.placeId,
        });

        recordUsage({
          tracker: input.usageTracker,
          providerRuns: result.providerRuns,
          durationMs: result.totalDurationMs,
          finalProvider: result.provider,
          confidence: result.providerConfidence,
          fallbackUsed: true,
          requiresReview: false,
        });

        return result;
      }


      /*
       * RoutePro Toponym Consensus Rescue
       *
       * Runs only for rural/named-place addresses after exact-address rescue
       * failed. It may relax the textual identity mismatch only when:
       * - permanent Mapbox returned an address-layer candidate with exact
       *   house number + city;
       * - the alternate rural name is only a conservative variant;
       * - Google independently confirms that alternate named place;
       * - Google and Mapbox coordinates converge within 750 m.
       *
       * The final coordinate is the already-returned PERMANENT MAPBOX point.
       * Google is consensus evidence only, so no Google coordinate is cached.
       */
      if (resolverResult.toponymConsensusRescue) {
        const rescue = resolverResult.toponymConsensusRescue;
        const result: RouteProSmartGeocoderResult = {
          version: ROUTEPRO_SMART_GEOCODER_VERSION,
          status: "success",
          canonical,
          lat: rescue.lat,
          lng: rescue.lng,
          // Keep the original delivery address visible to the driver.
          label: input.address,
          provider: "mapbox",
          providerConfidence: rescue.confidence,
          qualityScore: 96,
          decision: null,
          requiresReview: false,
          fallbackUsed: true,
          totalDurationMs: Date.now() - startedAt,
          providerRuns,
          message: "Toponimo rurale risolto tramite consenso geografico Mapbox + Google Places.",
          coordinateExpiresAt: null,
          googlePlaceId: rescue.googlePlaceId,
        };

        console.info("RoutePro Toponym Consensus Rescue success:", {
          address: input.address,
          originalIdentity: rescue.originalIdentity,
          resolvedIdentity: rescue.resolvedIdentity,
          consensusDistanceKm: rescue.consensusDistanceKm,
          provider: "mapbox",
          confidence: rescue.confidence,
        });

        recordUsage({
          tracker: input.usageTracker,
          providerRuns: result.providerRuns,
          durationMs: result.totalDurationMs,
          finalProvider: result.provider,
          confidence: result.providerConfidence,
          fallbackUsed: true,
          requiresReview: false,
        });

        return result;
      }

      for (const resolverQuery of resolverResult.queries.slice(0, 3)) {
        const resolverCanonical = canonicalizeRouteProAddress(resolverQuery, {
          context: input.context,
          knowledge: input.knowledge,
        });

        if (!resolverCanonical.raw.trim()) continue;

        const resolverMapboxRun = await runMapbox({
          canonical: resolverCanonical,
          focusPoint: input.focusPoint,
          countryCode,
          mode,
        });

        providerRuns.push(resolverMapboxRun);

        if (resolverMapboxRun.accepted) {
          const result = buildSuccessResult({
            canonical,
            run: resolverMapboxRun,
            providerRuns,
            fallbackUsed: true,
            startedAt,
          });

          console.info("RoutePro AI Address Resolver success:", {
            originalAddress: input.address,
            resolverQuery,
            provider: result.provider,
            qualityScore: result.qualityScore,
            label: result.label,
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

        const resolverOrsRun = await runOpenRouteService({
          canonical: resolverCanonical,
          focusPoint: input.focusPoint,
          countryCode,
        });

        providerRuns.push(resolverOrsRun);

        if (resolverOrsRun.accepted) {
          const result = buildSuccessResult({
            canonical,
            run: resolverOrsRun,
            providerRuns,
            fallbackUsed: true,
            startedAt,
          });

          console.info("RoutePro AI Address Resolver success:", {
            originalAddress: input.address,
            resolverQuery,
            provider: result.provider,
            qualityScore: result.qualityScore,
            label: result.label,
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
      }
    } catch (error) {
      // Resolver failure must NEVER make normal geocoding worse.
      console.error("RoutePro AI Address Resolver skipped after error:", error);
    }
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

  if (result.requiresReview) {
    const providerDiagnostics = result.providerRuns.map((run) => ({
      provider: run.provider,
      attemptedQueries: run.providerResult.attemptedQueries,
      topCandidates: run.ranking.slice(0, 3).map((ranked) => ({
        label: ranked.candidate.label,
        street: ranked.candidate.street,
        houseNumber: ranked.candidate.houseNumber,
        locality: ranked.candidate.locality,
        city: ranked.candidate.city,
        province: ranked.candidate.province,
        layer: ranked.candidate.layer,
        confidence: ranked.candidate.confidence,
        score: ranked.score,
        decision: ranked.decision,
        usableAsStopCoordinate: ranked.usableAsStopCoordinate,
        evidence: ranked.evidence.map((item) => ({
          code: item.code,
          score: item.score,
          message: item.message,
        })),
      })),
    }));

    console.warn(
      "RoutePro Smart Geocoder Production Diagnostic JSON:",
      JSON.stringify(
        {
          inputAddress: input.address,
          canonical: {
            streetName: canonical.streetName,
            houseNumber: canonical.houseNumber,
            locality: canonical.locality,
            city: canonical.city,
            province: canonical.province,
            postalCode: canonical.postalCode,
            countryCode: canonical.countryCode,
            providerQueries: canonical.providerQueries,
          },
          focusPoint: input.focusPoint ?? null,
          status: result.status,
          providerDiagnostics,
        },
        null,
        2,
      ),
    );
  }

  return result;
}