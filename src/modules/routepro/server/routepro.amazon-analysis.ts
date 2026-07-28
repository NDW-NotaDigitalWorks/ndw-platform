export type AmazonAssistStop = {
  id: string;
  position: number;
  original_position?: number;
  lat: number;
  lng: number;
  address?: string;
};

export type AmazonAssistPoint = {
  lat: number;
  lng: number;
};

export type AmazonAssistAnomalyType =
  | "street_revisit"
  | "nearby_stop_revisit"
  | "route_jump";

export type AmazonAssistAnomaly = {
  type: AmazonAssistAnomalyType;
  stopIds: string[];
  fromIndex: number;
  toIndex: number;
  severity: number;
  description: string;
  estimatedSavingMeters: number;
  estimatedSavingSeconds: number;
};

export type AmazonAssistAnalysisCounts = {
  streetRevisits: number;
  nearbyStopRevisits: number;
  routeJumps: number;
  total: number;
};

export type AmazonAssistRecommendation =
  | "no_change_recommended"
  | "minor_corrections_available"
  | "optimization_recommended"
  | "strong_optimization_recommended";

export type AmazonAssistAnalysisResult = {
  routeScore: number;
  anomalies: AmazonAssistAnomaly[];
  counts: AmazonAssistAnalysisCounts;
  estimatedCorrections: number;
  estimatedSavingMeters: number;
  estimatedSavingSeconds: number;
  recommendation: AmazonAssistRecommendation;
};

const NEARBY_STOP_RADIUS_KM = 0.12;
const ROUTE_JUMP_MIN_DISTANCE_KM = 1.2;
const STREET_REVISIT_MIN_GAP = 3;

const MAX_REPORTED_ANOMALIES = 50;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  first: AmazonAssistPoint,
  second: AmazonAssistPoint,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(second.lat - first.lat);
  const longitudeDifference = toRadians(second.lng - first.lng);

  const firstLatitude = toRadians(first.lat);
  const secondLatitude = toRadians(second.lat);

  const latitudeValue = Math.sin(latitudeDifference / 2);
  const longitudeValue = Math.sin(longitudeDifference / 2);

  const haversineValue =
    latitudeValue * latitudeValue +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      longitudeValue *
      longitudeValue;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(haversineValue),
      Math.sqrt(1 - haversineValue),
    )
  );
}

function normalizeAddress(address: string | undefined): string {
  if (!address) {
    return "";
  }

  return address
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ");
}

function extractStreetKey(address: string | undefined): string {
  const normalizedAddress = normalizeAddress(address);

  if (!normalizedAddress) {
    return "";
  }

  return normalizedAddress
    .replace(/\b\d{5}\b/g, " ")
    .replace(/\b\d{1,4}[a-z]?\b/g, " ")
    .replace(
      /\b(italia|italy|milano|monza|brianza|mb|mi|lc|co|bg|va)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function getOriginalSequencePosition(stop: AmazonAssistStop): number {
  const originalPosition = Number(stop.original_position);

  if (Number.isFinite(originalPosition) && originalPosition > 0) {
    return originalPosition;
  }

  return Number(stop.position);
}

export function sortAmazonStopsByOriginalSequence(
  stops: AmazonAssistStop[],
): AmazonAssistStop[] {
  return [...stops].sort(
    (first, second) =>
      getOriginalSequencePosition(first) -
      getOriginalSequencePosition(second),
  );
}

function detectStreetRevisits(
  stops: AmazonAssistStop[],
): AmazonAssistAnomaly[] {
  const anomalies: AmazonAssistAnomaly[] = [];
  const streetIndexes = new Map<string, number[]>();

  for (let index = 0; index < stops.length; index += 1) {
    const streetKey = extractStreetKey(stops[index].address);

    if (!streetKey) {
      continue;
    }

    const indexes = streetIndexes.get(streetKey) ?? [];
    indexes.push(index);
    streetIndexes.set(streetKey, indexes);
  }

  for (const [streetKey, indexes] of streetIndexes.entries()) {
    if (indexes.length < 2) {
      continue;
    }

    for (let index = 1; index < indexes.length; index += 1) {
      const previousIndex = indexes[index - 1];
      const currentIndex = indexes[index];
      const gap = currentIndex - previousIndex;

      if (gap < STREET_REVISIT_MIN_GAP) {
        continue;
      }

      const previousStop = stops[previousIndex];
      const currentStop = stops[currentIndex];

      const distanceMeters = Math.round(
        getDistanceKm(previousStop, currentStop) * 1000,
      );

      const estimatedSavingMeters = Math.max(
        100,
        Math.min(1200, distanceMeters),
      );

      anomalies.push({
        type: "street_revisit",
        stopIds: [previousStop.id, currentStop.id],
        fromIndex: previousIndex,
        toIndex: currentIndex,
        severity: Math.min(100, 35 + gap * 3),
        description:
          `La sequenza lascia la via "${streetKey}" e vi ritorna dopo ${gap - 1} stop.`,
        estimatedSavingMeters,
        estimatedSavingSeconds: Math.max(
          45,
          Math.round(estimatedSavingMeters / 4),
        ),
      });
    }
  }

  return anomalies;
}

function detectNearbyStopRevisits(
  stops: AmazonAssistStop[],
): AmazonAssistAnomaly[] {
  const anomalies: AmazonAssistAnomaly[] = [];

  for (let firstIndex = 0; firstIndex < stops.length; firstIndex += 1) {
    const firstStop = stops[firstIndex];

    for (
      let secondIndex = firstIndex + STREET_REVISIT_MIN_GAP;
      secondIndex < stops.length;
      secondIndex += 1
    ) {
      const secondStop = stops[secondIndex];

      const distanceKm = getDistanceKm(firstStop, secondStop);

      if (distanceKm > NEARBY_STOP_RADIUS_KM) {
        continue;
      }

      const distanceMeters = Math.round(distanceKm * 1000);
      const separatedStops = secondIndex - firstIndex - 1;

      anomalies.push({
        type: "nearby_stop_revisit",
        stopIds: [firstStop.id, secondStop.id],
        fromIndex: firstIndex,
        toIndex: secondIndex,
        severity: Math.min(100, 50 + separatedStops),
        description:
          `Due stop distanti circa ${distanceMeters} metri sono separati da ${separatedStops} stop.`,
        estimatedSavingMeters: Math.max(80, distanceMeters),
        estimatedSavingSeconds: Math.max(
          40,
          Math.min(180, 40 + separatedStops * 3),
        ),
      });
    }
  }

  return anomalies;
}

function detectRouteJumps(
  stops: AmazonAssistStop[],
): AmazonAssistAnomaly[] {
  const anomalies: AmazonAssistAnomaly[] = [];

  if (stops.length < 3) {
    return anomalies;
  }

  for (let index = 1; index < stops.length - 1; index += 1) {
    const previousStop = stops[index - 1];
    const currentStop = stops[index];
    const nextStop = stops[index + 1];

    const distanceToCurrent = getDistanceKm(
      previousStop,
      currentStop,
    );

    const distanceFromCurrent = getDistanceKm(
      currentStop,
      nextStop,
    );

    const previousToNextDistance = getDistanceKm(
      previousStop,
      nextStop,
    );

    const detourDistance =
      distanceToCurrent +
      distanceFromCurrent -
      previousToNextDistance;

    if (
      distanceToCurrent < ROUTE_JUMP_MIN_DISTANCE_KM ||
      distanceFromCurrent < ROUTE_JUMP_MIN_DISTANCE_KM ||
      detourDistance < ROUTE_JUMP_MIN_DISTANCE_KM
    ) {
      continue;
    }

    const estimatedSavingMeters = Math.round(
      detourDistance * 1000,
    );

    anomalies.push({
      type: "route_jump",
      stopIds: [
        previousStop.id,
        currentStop.id,
        nextStop.id,
      ],
      fromIndex: index - 1,
      toIndex: index + 1,
      severity: Math.min(
        100,
        Math.round(45 + detourDistance * 15),
      ),
      description:
        `Lo stop centrale potrebbe generare una deviazione di circa ${detourDistance.toFixed(1)} km.`,
      estimatedSavingMeters,
      estimatedSavingSeconds: Math.max(
        90,
        Math.round(estimatedSavingMeters / 8),
      ),
    });
  }

  return anomalies;
}

function removeDuplicateAnomalies(
  anomalies: AmazonAssistAnomaly[],
): AmazonAssistAnomaly[] {
  const uniqueAnomalies = new Map<string, AmazonAssistAnomaly>();

  for (const anomaly of anomalies) {
    const sortedStopIds = [...anomaly.stopIds].sort().join(":");
    const key = `${anomaly.type}:${sortedStopIds}`;

    const existing = uniqueAnomalies.get(key);

    if (!existing || anomaly.severity > existing.severity) {
      uniqueAnomalies.set(key, anomaly);
    }
  }

  return Array.from(uniqueAnomalies.values());
}

function calculateRouteScore(
  anomalies: AmazonAssistAnomaly[],
): number {
  const penalty = anomalies.reduce((total, anomaly) => {
    switch (anomaly.type) {
      case "street_revisit":
        return total + Math.min(10, anomaly.severity / 10);

      case "nearby_stop_revisit":
        return total + Math.min(7, anomaly.severity / 14);

      case "route_jump":
        return total + Math.min(12, anomaly.severity / 8);

      default:
        return total;
    }
  }, 0);

  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

function getRecommendation(
  routeScore: number,
): AmazonAssistRecommendation {
  if (routeScore >= 92) {
    return "no_change_recommended";
  }

  if (routeScore >= 80) {
    return "minor_corrections_available";
  }

  if (routeScore >= 60) {
    return "optimization_recommended";
  }

  return "strong_optimization_recommended";
}

export function analyzeAmazonRoute(
  stops: AmazonAssistStop[],
): AmazonAssistAnalysisResult {
  const originalSequence =
    sortAmazonStopsByOriginalSequence(stops);

  const detectedAnomalies = removeDuplicateAnomalies([
    ...detectStreetRevisits(originalSequence),
    ...detectNearbyStopRevisits(originalSequence),
    ...detectRouteJumps(originalSequence),
  ])
    .sort((first, second) => second.severity - first.severity)
    .slice(0, MAX_REPORTED_ANOMALIES);

  const streetRevisits = detectedAnomalies.filter(
    (anomaly) => anomaly.type === "street_revisit",
  ).length;

  const nearbyStopRevisits = detectedAnomalies.filter(
    (anomaly) => anomaly.type === "nearby_stop_revisit",
  ).length;

  const routeJumps = detectedAnomalies.filter(
    (anomaly) => anomaly.type === "route_jump",
  ).length;

  const routeScore = calculateRouteScore(detectedAnomalies);

  const estimatedSavingMeters = detectedAnomalies.reduce(
    (total, anomaly) =>
      total + anomaly.estimatedSavingMeters,
    0,
  );

  const estimatedSavingSeconds = detectedAnomalies.reduce(
    (total, anomaly) =>
      total + anomaly.estimatedSavingSeconds,
    0,
  );

  return {
    routeScore,
    anomalies: detectedAnomalies,
    counts: {
      streetRevisits,
      nearbyStopRevisits,
      routeJumps,
      total: detectedAnomalies.length,
    },
    estimatedCorrections: detectedAnomalies.filter(
      (anomaly) => anomaly.severity >= 55,
    ).length,
    estimatedSavingMeters,
    estimatedSavingSeconds,
    recommendation: getRecommendation(routeScore),
  };
}
