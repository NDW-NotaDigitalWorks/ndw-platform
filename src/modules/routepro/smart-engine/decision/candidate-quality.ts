/**
 * RPSE-005A / RPSE-008 — Candidate Quality Gate v1.1
 */

import {
  normalizeRouteProComparableText,
} from "@/modules/routepro/server/routepro.address-intelligence";
import type {
  RouteProCanonicalAddress,
} from "@/modules/routepro/smart-engine/address/address-canonicalizer";
import {
  compareRouteProHouseNumbers,
  normalizeRouteProStreetComparable,
  routeProProvincesMatch,
  routeProStreetNamesMatch,
} from "@/modules/routepro/smart-engine/decision/address-equivalence";
import type {
  RouteProProviderCandidate,
} from "@/modules/routepro/smart-engine/provider/provider-adapter";

export const ROUTEPRO_CANDIDATE_QUALITY_VERSION = "1.3.1";

export type RouteProCandidateDecision =
  | "accept"
  | "fallback"
  | "reference_only"
  | "reject";

export type RouteProCandidateEvidenceCode =
  | "address_layer"
  | "street_layer"
  | "generic_layer"
  | "street_match"
  | "street_core_match"
  | "street_mismatch"
  | "house_number_match"
  | "house_number_base_match"
  | "house_number_missing"
  | "house_number_mismatch"
  | "locality_match"
  | "locality_mismatch"
  | "province_match"
  | "province_mismatch"
  | "country_match"
  | "country_mismatch"
  | "provider_confidence";

export type RouteProCandidateEvidence = {
  code: RouteProCandidateEvidenceCode;
  score: number;
  message: string;
};

export type RouteProCandidateQualityResult = {
  version: string;
  candidate: RouteProProviderCandidate;
  decision: RouteProCandidateDecision;
  score: number;
  confidence: number;
  usableAsStopCoordinate: boolean;
  evidence: RouteProCandidateEvidence[];
};

const ADDRESS_LAYERS = new Set(["address", "venue"]);
const STREET_LAYERS = new Set(["street"]);
const GENERIC_LAYERS = new Set([
  "locality",
  "localadmin",
  "county",
  "region",
  "country",
  "postalcode",
  "place",
]);

function normalize(value: string | null | undefined): string {
  return normalizeRouteProComparableText(value ?? "");
}

function containsComparable(
  haystack: string | null | undefined,
  needle: string | null | undefined,
): boolean {
  const left = normalize(haystack);
  const right = normalize(needle);

  if (!left || !right) return false;

  return left.includes(right) || right.includes(left);
}

const STREET_PREFIX_TOKENS = new Set([
  "via",
  "viale",
  "piazza",
  "corso",
  "strada",
  "vicolo",
  "largo",
  "contrada",
]);

function streetCoreTokens(value: string | null | undefined): string[] {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STREET_PREFIX_TOKENS.has(token));
}

function routeProStreetCoreNamesMatch(
  requestedStreet: string | null | undefined,
  candidateStreet: string | null | undefined,
): boolean {
  const requestedTokens = streetCoreTokens(requestedStreet);
  const candidateTokens = streetCoreTokens(candidateStreet);

  if (requestedTokens.length === 0 || candidateTokens.length === 0) return false;

  const shorter =
    requestedTokens.length <= candidateTokens.length ? requestedTokens : candidateTokens;
  const longer =
    requestedTokens.length <= candidateTokens.length ? candidateTokens : requestedTokens;

  return shorter.every((token) => longer.includes(token));
}

function candidateLocalityText(candidate: RouteProProviderCandidate): string {
  return [candidate.locality, candidate.city].filter(Boolean).join(" ");
}

function candidateAdministrativeText(
  candidate: RouteProProviderCandidate,
): string {
  return [
    candidate.label,
    candidate.locality,
    candidate.city,
    candidate.province,
    candidate.postalCode,
    candidate.region,
    candidate.country,
    candidate.countryCode,
  ]
    .filter(Boolean)
    .join(" ");
}

export function evaluateRouteProCandidateQuality(params: {
  canonical: RouteProCanonicalAddress;
  candidate: RouteProProviderCandidate;
}): RouteProCandidateQualityResult {
  const { canonical, candidate } = params;
  const evidence: RouteProCandidateEvidence[] = [];
  const layer = normalize(candidate.layer);

  let score = 0;

  if (ADDRESS_LAYERS.has(layer)) {
    score += 32;
    evidence.push({
      code: "address_layer",
      score: 32,
      message: "Il provider ha restituito un punto di tipo indirizzo.",
    });
  } else if (STREET_LAYERS.has(layer)) {
    score += 15;
    evidence.push({
      code: "street_layer",
      score: 15,
      message: "Il provider ha restituito una strada, non un civico.",
    });
  } else if (GENERIC_LAYERS.has(layer) || !layer) {
    score -= 45;
    evidence.push({
      code: "generic_layer",
      score: -45,
      message:
        "Il candidato rappresenta una località o un'area amministrativa, non uno stop.",
    });
  }

  const candidateStreetText =
    candidate.street?.trim() ||
    candidate.label?.trim() ||
    "";

  if (
    canonical.streetName &&
    routeProStreetNamesMatch(
      canonical.streetName,
      candidateStreetText,
    )
  ) {
    score += 28;
    evidence.push({
      code: "street_match",
      score: 28,
      message:
        "La strada coincide anche dopo la normalizzazione di numeri romani e forme testuali.",
    });
  } else if (
    canonical.streetName &&
    routeProStreetCoreNamesMatch(
      canonical.streetName,
      candidateStreetText,
    )
  ) {
    score += 22;
    evidence.push({
      code: "street_core_match",
      score: 22,
      message:
        "La strada coincide per identità principale anche se il provider omette parte del nome.",
    });
  } else if (canonical.streetName) {
    score -= 25;
    evidence.push({
      code: "street_mismatch",
      score: -25,
      message: [
        "La strada richiesta non compare nel candidato.",
        `RAW requested="${canonical.streetName}"`,
        `RAW candidate="${candidateStreetText}"`,
        `NORMALIZED requested="${normalizeRouteProStreetComparable(
          canonical.streetName,
        )}"`,
        `NORMALIZED candidate="${normalizeRouteProStreetComparable(
          candidateStreetText,
        )}"`,
      ].join(" | "),
    });
  }

  const streetMatches = evidence.some(
    (item) =>
      item.code === "street_match" ||
      item.code === "street_core_match",
  );

  const hardStreetMismatch =
    Boolean(canonical.streetName) &&
    !streetMatches;

  const houseNumberMatch = compareRouteProHouseNumbers(
    canonical.houseNumber,
    candidate.houseNumber,
  );

  if (houseNumberMatch === "exact") {
    score += 20;
    evidence.push({
      code: "house_number_match",
      score: 20,
      message: "Il civico coincide.",
    });
  } else if (houseNumberMatch === "base_match") {
    score += 11;
    evidence.push({
      code: "house_number_base_match",
      score: 11,
      message:
        "Il numero base coincide, ma il provider non conferma esattamente il suffisso.",
    });
  } else if (houseNumberMatch === "missing") {
    score -= 4;
    evidence.push({
      code: "house_number_missing",
      score: -4,
      message: "Il provider non ha restituito il civico.",
    });
  } else {
    score -= 12;
    evidence.push({
      code: "house_number_mismatch",
      score: -12,
      message: "Il civico del candidato è differente.",
    });
  }

  const administrativeText =
    candidateAdministrativeText(candidate);
  const candidateLocality = candidateLocalityText(candidate);
  const requestedLocality =
    canonical.city ?? canonical.locality;

  const localityMatches =
    !requestedLocality ||
    containsComparable(candidateLocality || administrativeText, requestedLocality);

  const hardLocalityMismatch =
    Boolean(requestedLocality) &&
    Boolean(normalize(candidateLocality)) &&
    !containsComparable(candidateLocality, requestedLocality);

  if (requestedLocality) {
    if (localityMatches) {
      score += 18;
      evidence.push({
        code: "locality_match",
        score: 18,
        message: "La località del candidato è coerente.",
      });
    } else {
      score -= 24;
      evidence.push({
        code: "locality_mismatch",
        score: -24,
        message: "La località del candidato non coincide.",
      });
    }
  }

  if (canonical.province) {
    if (
      routeProProvincesMatch(
        canonical.province,
        administrativeText,
      )
    ) {
      score += 10;
      evidence.push({
        code: "province_match",
        score: 10,
        message:
          "La provincia coincide per sigla o denominazione estesa.",
      });
    } else {
      score -= 20;
      evidence.push({
        code: "province_mismatch",
        score: -20,
        message: "La provincia non coincide.",
      });
    }
  }

  const countryText = [
    candidate.country,
    candidate.countryCode,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    containsComparable(countryText, canonical.countryName) ||
    containsComparable(countryText, canonical.countryCode)
  ) {
    score += 8;
    evidence.push({
      code: "country_match",
      score: 8,
      message: "Il paese è coerente.",
    });
  } else if (countryText) {
    score -= 60;
    evidence.push({
      code: "country_mismatch",
      score: -60,
      message: "Il candidato appartiene a un altro paese.",
    });
  }

  if (
    typeof candidate.confidence === "number" &&
    Number.isFinite(candidate.confidence)
  ) {
    const confidenceScore = Math.round(
      Math.max(0, Math.min(1, candidate.confidence)) * 12,
    );

    score += confidenceScore;
    evidence.push({
      code: "provider_confidence",
      score: confidenceScore,
      message: `Confidence provider: ${candidate.confidence}.`,
    });
  }
    const boundedScore = Math.max(-100, Math.min(100, score));

  let decision: RouteProCandidateDecision;

  if (GENERIC_LAYERS.has(layer) || !layer) {
    decision = "reference_only";
  } else if (hardLocalityMismatch || hardStreetMismatch) {
    decision = boundedScore >= 45 ? "fallback" : "reject";
  } else if (boundedScore >= 70 && ADDRESS_LAYERS.has(layer)) {
    decision = "accept";
  } else if (boundedScore >= 45) {
    decision = "fallback";
  } else {
    decision = "reject";
  }

  return {
    version: ROUTEPRO_CANDIDATE_QUALITY_VERSION,
    candidate,
    decision,
    score: boundedScore,
    confidence: Math.max(0, Math.min(100, boundedScore)),
    usableAsStopCoordinate: decision === "accept",
    evidence,
  };
}

export function rankRouteProCandidates(params: {
  canonical: RouteProCanonicalAddress;
  candidates: RouteProProviderCandidate[];
}): RouteProCandidateQualityResult[] {
  return params.candidates
    .map((candidate) =>
      evaluateRouteProCandidateQuality({
        canonical: params.canonical,
        candidate,
      }),
    )
    .sort((first, second) => second.score - first.score);
}