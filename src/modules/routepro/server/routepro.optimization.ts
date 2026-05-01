export type RouteProOptimizationStop = {
  id: string;
  position: number;
  lat: number;
  lng: number;
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
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

export function optimizeStopsNearestNeighbor(
  stops: RouteProOptimizationStop[],
  startPoint?: { lat: number; lng: number } | null,
): RouteProOptimizationStop[] {
  if (stops.length <= 1) {
    return stops;
  }

  const remaining = [...stops];
  const ordered: RouteProOptimizationStop[] = [];

  let currentPoint =
    startPoint ??
    {
      lat: remaining[0].lat,
      lng: remaining[0].lng,
    };

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];

      const distance = getDistanceKm(currentPoint, {
        lat: candidate.lat,
        lng: candidate.lng,
      });

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }

    const [nextStop] = remaining.splice(bestIndex, 1);
    ordered.push(nextStop);

    currentPoint = {
      lat: nextStop.lat,
      lng: nextStop.lng,
    };
  }

  return ordered;
}