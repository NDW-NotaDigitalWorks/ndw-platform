export type RouteProClusterStop = {
  id: string;
  position: number;
  original_position: number;
  address: string;
  status: string;
  lat: number | null;
  lng: number | null;
};

export type RouteProDeliveryCluster = {
  normalizedAddress: string;
  address: string;
  stops: RouteProClusterStop[];
  workflowPosition: number;
};

export function normalizeAddressForCluster(address: string): string {
  return address
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "");
}

export function buildDeliveryClusters(
  stops: RouteProClusterStop[],
): RouteProDeliveryCluster[] {
  const groups = new Map<string, RouteProClusterStop[]>();

  for (const stop of stops) {
    const key = normalizeAddressForCluster(stop.address);
    const current = groups.get(key) ?? [];
    current.push(stop);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([normalizedAddress, groupedStops]) => {
      const sortedStops = [...groupedStops].sort(
        (a, b) => a.position - b.position,
      );

      return {
        normalizedAddress,
        address: sortedStops[0]?.address ?? normalizedAddress,
        stops: sortedStops,
        workflowPosition: sortedStops[0]?.position ?? 0,
      };
    })
    .sort((a, b) => a.workflowPosition - b.workflowPosition);
}

export function getMultiStopDeliveryClusters(
  stops: RouteProClusterStop[],
): RouteProDeliveryCluster[] {
  return buildDeliveryClusters(stops).filter(
    (cluster) => cluster.stops.length > 1,
  );
}

export function getClusterStopsForCurrentStop(
  currentStop: RouteProClusterStop | undefined,
  stops: RouteProClusterStop[],
): RouteProClusterStop[] {
  if (!currentStop) return [];

  const currentKey = normalizeAddressForCluster(currentStop.address);

  return stops
    .filter((stop) => normalizeAddressForCluster(stop.address) === currentKey)
    .sort((a, b) => a.original_position - b.original_position);
}