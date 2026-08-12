/**
 * RPSE-009A — Candidate Distance Filter v1
 *
 * Pure TypeScript utility for measuring a candidate's distance from a
 * route focus point and assigning a reusable distance category and score.
 *
 * No framework, database or provider dependency.
 */

export const ROUTEPRO_DISTANCE_FILTER_VERSION = "1.0.0";

export type RouteProGeoPoint = {
  lat: number;
  lng: number;
};

export type RouteProDistanceCategory =
  | "excellent"
  | "good"
  | "fair"
  | "weak"
  | "far"
  | "outlier"
  | "unknown";

export type RouteProDistanceEvaluation = {
  version: string;
  distanceKm: number | null;
  distanceMeters: number | null;
  category: RouteProDistanceCategory;
  score: number;
  withinExpectedArea: boolean;
  shouldPrune: boolean;
  reason: string;
};

export type RouteProDistanceFilterOptions = {
  excellentKm?: number;
  goodKm?: number;
  fairKm?: number;
  weakKm?: number;
  outlierKm?: number;
  pruneOutliers?: boolean;
};

const EARTH_RADIUS_KM = 6371.0088;
const DEFAULT_EXCELLENT_KM = 2;
const DEFAULT_GOOD_KM = 5;
const DEFAULT_FAIR_KM = 10;
const DEFAULT_WEAK_KM = 20;
const DEFAULT_OUTLIER_KM = 50;

function isValidGeoPoint(
  point: RouteProGeoPoint | null | undefined,
): point is RouteProGeoPoint {
  return Boolean(
    point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180,
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateRouteProDistanceKm(
  first: RouteProGeoPoint,
  second: RouteProGeoPoint,
): number {
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(deltaLng / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * angularDistance;
}

export function evaluateRouteProCandidateDistance(params: {
  focusPoint: RouteProGeoPoint | null | undefined;
  candidatePoint: RouteProGeoPoint | null | undefined;
  options?: RouteProDistanceFilterOptions;
}): RouteProDistanceEvaluation {
  const options = params.options ?? {};

  if (
    !isValidGeoPoint(params.focusPoint) ||
    !isValidGeoPoint(params.candidatePoint)
  ) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: null,
      distanceMeters: null,
      category: "unknown",
      score: 0,
      withinExpectedArea: false,
      shouldPrune: false,
      reason:
        "Distanza non calcolabile: focus point o coordinate candidato non valide.",
    };
  }

  const excellentKm = options.excellentKm ?? DEFAULT_EXCELLENT_KM;
  const goodKm = options.goodKm ?? DEFAULT_GOOD_KM;
  const fairKm = options.fairKm ?? DEFAULT_FAIR_KM;
  const weakKm = options.weakKm ?? DEFAULT_WEAK_KM;
  const outlierKm = options.outlierKm ?? DEFAULT_OUTLIER_KM;
  const pruneOutliers = options.pruneOutliers ?? true;

  const distanceKm = calculateRouteProDistanceKm(
    params.focusPoint,
    params.candidatePoint,
  );

  const roundedDistanceKm = Math.round(distanceKm * 1000) / 1000;
  const distanceMeters = Math.round(distanceKm * 1000);

  if (distanceKm <= excellentKm) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: roundedDistanceKm,
      distanceMeters,
      category: "excellent",
      score: 40,
      withinExpectedArea: true,
      shouldPrune: false,
      reason: "Candidato molto vicino al focus geografico.",
    };
  }

  if (distanceKm <= goodKm) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: roundedDistanceKm,
      distanceMeters,
      category: "good",
      score: 25,
      withinExpectedArea: true,
      shouldPrune: false,
      reason: "Candidato vicino al focus geografico.",
    };
  }

  if (distanceKm <= fairKm) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: roundedDistanceKm,
      distanceMeters,
      category: "fair",
      score: 15,
      withinExpectedArea: true,
      shouldPrune: false,
      reason: "Candidato ancora coerente con l'area prevista.",
    };
  }

  if (distanceKm <= weakKm) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: roundedDistanceKm,
      distanceMeters,
      category: "weak",
      score: 5,
      withinExpectedArea: true,
      shouldPrune: false,
      reason: "Candidato distante ma ancora plausibile.",
    };
  }

  if (distanceKm <= outlierKm) {
    return {
      version: ROUTEPRO_DISTANCE_FILTER_VERSION,
      distanceKm: roundedDistanceKm,
      distanceMeters,
      category: "far",
      score: 0,
      withinExpectedArea: false,
      shouldPrune: false,
      reason:
        "Candidato lontano dal focus: richiede ulteriori verifiche.",
    };
  }

  return {
    version: ROUTEPRO_DISTANCE_FILTER_VERSION,
    distanceKm: roundedDistanceKm,
    distanceMeters,
    category: "outlier",
    score: -40,
    withinExpectedArea: false,
    shouldPrune: pruneOutliers,
    reason:
      "Candidato oltre la distanza massima prevista e classificato come outlier.",
  };
}