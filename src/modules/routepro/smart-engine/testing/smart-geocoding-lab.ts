/**
 * RPSE-007B — Smart Geocoding Lab v1.2
 * Supports OpenRouteService and Mapbox.
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
  type RouteProProviderExecutor,
  type RouteProProviderName,
} from "@/modules/routepro/smart-engine/provider/provider-adapter";
import {
  createOpenRouteServiceProviderExecutor,
  type RouteProOrsFocusPoint,
} from "@/modules/routepro/smart-engine/provider/openrouteservice-provider";
import { createMapboxProviderExecutor } from "@/modules/routepro/smart-engine/provider/mapbox-provider";

export const ROUTEPRO_SMART_GEOCODING_LAB_VERSION = "1.2.0";

export type RouteProSmartGeocodingLabProvider =
  | "openrouteservice"
  | "mapbox";

export type RouteProSmartGeocodingLabInput = {
  address: string;
  provider?: RouteProSmartGeocodingLabProvider;
  context?: RouteProCanonicalizerContext;
  knowledge?: RouteProCanonicalizerKnowledge;
  focusPoint?: RouteProOrsFocusPoint | null;
  countryCode?: string;
};

export type RouteProSmartGeocodingLabResult = {
  version: string;
  providerName: RouteProSmartGeocodingLabProvider;
  canonical: RouteProCanonicalAddress;
  provider: RouteProProviderAdapterResult;
  ranking: RouteProCandidateQualityResult[];
  selectedCandidate: RouteProCandidateQualityResult | null;
};

function createProvider(params: {
  provider: RouteProSmartGeocodingLabProvider;
  focusPoint?: RouteProOrsFocusPoint | null;
  countryCode: string;
}): {
  providerName: RouteProProviderName;
  execute: RouteProProviderExecutor;
} {
  if (params.provider === "mapbox") {
    return {
      providerName: "mapbox",
      execute: createMapboxProviderExecutor({
        focusPoint: params.focusPoint,
        countryCode: params.countryCode,
        language: "it",
        limit: 10,
        permanent: false,
      }),
    };
  }

  return {
    providerName: "openrouteservice",
    execute: createOpenRouteServiceProviderExecutor({
      focusPoint: params.focusPoint,
      countryCode: params.countryCode,
      size: 10,
    }),
  };
}

export async function runRouteProSmartGeocodingLab(
  input: RouteProSmartGeocodingLabInput,
): Promise<RouteProSmartGeocodingLabResult> {
  const providerChoice = input.provider ?? "openrouteservice";

  const canonical = canonicalizeRouteProAddress(input.address, {
    context: input.context,
    knowledge: input.knowledge,
  });

  const selectedProvider = createProvider({
    provider: providerChoice,
    focusPoint: input.focusPoint,
    countryCode: input.countryCode ?? canonical.countryCode,
  });

  const provider = await runRouteProProviderAdapter({
    provider: selectedProvider.providerName,
    queries: canonical.providerQueries,
    execute: selectedProvider.execute,
    options: {
      timeoutMs: 8_000,
      maxAttemptsPerQuery: 3,
      initialBackoffMs: 700,
      maxBackoffMs: 4_000,
      stopOnFirstCandidateSet: false,
      maxQueries: 5,
    },
  });

  const ranking = rankRouteProCandidates({
    canonical,
    candidates: provider.candidates,
  });

  const selectedCandidate =
    ranking.find((candidate) => candidate.usableAsStopCoordinate) ?? null;

  return {
    version: ROUTEPRO_SMART_GEOCODING_LAB_VERSION,
    providerName: providerChoice,
    canonical,
    provider,
    ranking,
    selectedCandidate,
  };
}