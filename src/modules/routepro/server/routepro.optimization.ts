export type RouteProOptimizationStop = {
  id: string;
  position: number;
  lat: number;
  lng: number;
  address?: string;
  original_position?: number;
};

type OptimizationPoint = {
  lat: number;
  lng: number;
};

type OptimizationCluster = {
  key: string;
  lat: number;
  lng: number;
  streetKey: string;
  houseNumber: number | null;
  stops: RouteProOptimizationStop[];
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function getDistanceKm(a: OptimizationPoint, b: OptimizationPoint): number {
  const earthRadiusKm = 6371;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);

  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const value =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function normalizeAddressForOptimization(address: string | undefined): string {
  if (!address) return "";

  return address
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "");
}

function extractHouseNumber(address: string | undefined): number | null {
  if (!address) return null;

  const match = address.match(/\b(\d{1,4})[a-zA-Z]?\b/);
  return match ? Number(match[1]) : null;
}

function extractStreetKey(address: string | undefined): string {
  const normalized = normalizeAddressForOptimization(address);

  return normalized
    .replace(/\b\d{1,4}[a-zA-Z]?\b/g, "")
    .replace(/\b(italia|italy)\b/g, "")
    .replace(/\b(mi|mb|lc|co|bg|va)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSmartClusterScore(
  currentPoint: OptimizationPoint,
  candidate: OptimizationCluster,
  previousCluster?: OptimizationCluster | null,
): number {
  let score = getDistanceKm(currentPoint, {
    lat: candidate.lat,
    lng: candidate.lng,
  });

  if (!previousCluster) {
    return score;
  }

  const sameStreet =
    previousCluster.streetKey.length > 0 &&
    previousCluster.streetKey === candidate.streetKey;

  if (sameStreet) {
    score *= 0.72;
  }

  if (
    sameStreet &&
    previousCluster.houseNumber !== null &&
    candidate.houseNumber !== null
  ) {
    const houseDiff = Math.abs(
      previousCluster.houseNumber - candidate.houseNumber,
    );

    if (houseDiff <= 4) {
      score *= 0.65;
    } else if (houseDiff <= 12) {
      score *= 0.82;
    }
  }

  return score;
}

function getCentroidPoint(clusters: OptimizationCluster[]): OptimizationPoint | null {
  if (clusters.length === 0) {
    return null;
  }

  return {
    lat: clusters.reduce((sum, cluster) => sum + cluster.lat, 0) / clusters.length,
    lng: clusters.reduce((sum, cluster) => sum + cluster.lng, 0) / clusters.length,
  };
}

function getEffectiveStartPoint(
  clusters: OptimizationCluster[],
  startPoint?: OptimizationPoint | null,
): OptimizationPoint | null {
  if (startPoint) {
    return startPoint;
  }

  return getCentroidPoint(clusters);
}

function buildOptimizationClusters(
  stops: RouteProOptimizationStop[],
): OptimizationCluster[] {
  const groups = new Map<string, RouteProOptimizationStop[]>();

  for (const stop of stops) {
    const key =
      normalizeAddressForOptimization(stop.address) ||
      `${stop.lat.toFixed(6)},${stop.lng.toFixed(6)}`;

    const current = groups.get(key) ?? [];
    current.push(stop);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([key, groupedStops]) => {
    const sortedStops = [...groupedStops].sort((a, b) => {
      const aOriginal = a.original_position ?? a.position;
      const bOriginal = b.original_position ?? b.position;
      return aOriginal - bOriginal;
    });

    const lat =
      sortedStops.reduce((sum, stop) => sum + stop.lat, 0) / sortedStops.length;
    const lng =
      sortedStops.reduce((sum, stop) => sum + stop.lng, 0) / sortedStops.length;

    const firstAddress = sortedStops[0]?.address;

return {
  key,
  lat,
  lng,
  streetKey: extractStreetKey(firstAddress),
  houseNumber: extractHouseNumber(firstAddress),
  stops: sortedStops,
};
  });
}

function optimizeClustersNearestNeighbor(
  clusters: OptimizationCluster[],
  startPoint?: OptimizationPoint | null,
): OptimizationCluster[] {
  if (clusters.length <= 1) {
    return clusters;
  }

  const remaining = [...clusters];
  const ordered: OptimizationCluster[] = [];
  let currentPoint = getEffectiveStartPoint(remaining, startPoint);
  let previousCluster: OptimizationCluster | null = null;

  if (!currentPoint) {
    return clusters;
  }

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];

      const score = getSmartClusterScore(
  currentPoint,
  candidate,
  previousCluster,
);

if (score < bestDistance) {
  bestDistance = score;
  bestIndex = index;
}
    }

    const [nextCluster] = remaining.splice(bestIndex, 1);
    ordered.push(nextCluster);
    previousCluster = nextCluster;

    currentPoint = {
      lat: nextCluster.lat,
      lng: nextCluster.lng,
    };
  }

  return ordered;
}

function getClusterRouteDistance(
  clusters: OptimizationCluster[],
  startPoint?: OptimizationPoint | null,
): number {
  if (clusters.length === 0) {
    return 0;
  }

  let totalDistance = 0;
  let currentPoint = getEffectiveStartPoint(clusters, startPoint);

  if (!currentPoint) {
    return 0;
  }

  for (const cluster of clusters) {
    totalDistance += getDistanceKm(currentPoint, {
      lat: cluster.lat,
      lng: cluster.lng,
    });

    currentPoint = {
      lat: cluster.lat,
      lng: cluster.lng,
    };
  }

  return totalDistance;
}

function twoOptSwap<T>(items: T[], startIndex: number, endIndex: number): T[] {
  return [
    ...items.slice(0, startIndex),
    ...items.slice(startIndex, endIndex + 1).reverse(),
    ...items.slice(endIndex + 1),
  ];
}

function refineClustersWithTwoOpt(
  clusters: OptimizationCluster[],
  startPoint?: OptimizationPoint | null,
): OptimizationCluster[] {
  if (clusters.length < 4) {
    return clusters;
  }

  let bestRoute = [...clusters];
  let bestDistance = getClusterRouteDistance(bestRoute, startPoint);
  let improved = true;
  let passes = 0;

  const maxPasses = 4;

  while (improved && passes < maxPasses) {
    improved = false;
    passes += 1;

    for (let startIndex = 1; startIndex < bestRoute.length - 2; startIndex += 1) {
      for (
        let endIndex = startIndex + 1;
        endIndex < bestRoute.length - 1;
        endIndex += 1
      ) {
        const candidateRoute = twoOptSwap(bestRoute, startIndex, endIndex);
        const candidateDistance = getClusterRouteDistance(
          candidateRoute,
          startPoint,
        );

        if (candidateDistance + 0.001 < bestDistance) {
          bestRoute = candidateRoute;
          bestDistance = candidateDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

export function optimizeStopsNearestNeighbor(
  stops: RouteProOptimizationStop[],
  startPoint?: OptimizationPoint | null,
): RouteProOptimizationStop[] {
  if (stops.length <= 1) {
    return stops;
  }

  const clusters = buildOptimizationClusters(stops);
  const nearestNeighborClusters = optimizeClustersNearestNeighbor(
    clusters,
    startPoint,
  );
  const refinedClusters = refineClustersWithTwoOpt(
    nearestNeighborClusters,
    startPoint,
  );

  return refinedClusters.flatMap((cluster) => cluster.stops);
}