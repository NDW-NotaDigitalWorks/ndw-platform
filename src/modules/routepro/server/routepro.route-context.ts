/**
 * RoutePro Smart Engine V3
 * Route Context Engine
 *
 * Builds a route-wide textual context before geocoding.
 * Pure TypeScript: no database, no provider, no city hardcoding.
 */

import {
  buildRouteProTextualContext,
  normalizeRouteProComparableText,
  parseRouteProAddress,
  type RouteProParsedAddress,
  type RouteProTextualRouteContext,
} from "@/modules/routepro/server/routepro.address-intelligence";

export type RouteProContextStreet = {
  key: string;
  label: string;
  count: number;
  share: number;
  localities: string[];
  houseNumbers: string[];
};

export type RouteProContextLocality = {
  key: string;
  label: string;
  count: number;
  share: number;
  province: string | null;
  postalCodes: string[];
};

export type RouteProRouteContext = {
  textual: RouteProTextualRouteContext;
  parsedAddresses: RouteProParsedAddress[];
  dominantLocality: RouteProContextLocality | null;
  dominantProvince: string | null;
  dominantPostalCode: string | null;
  localities: RouteProContextLocality[];
  streets: RouteProContextStreet[];
  sameLocalityRoute: boolean;
  multiLocalityRoute: boolean;
  confidence: number;
};

function uniqueSorted(values: Array<string | null>): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => Boolean(value?.trim()))
        .map((value) => value.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b, "it"));
}

function buildLocalityLabel(address: RouteProParsedAddress): string | null {
  const parts = [address.locality, address.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildLocalityContext(
  parsedAddresses: RouteProParsedAddress[],
): RouteProContextLocality[] {
  const map = new Map<
    string,
    {
      label: string;
      count: number;
      province: string | null;
      postalCodes: Array<string | null>;
    }
  >();

  for (const address of parsedAddresses) {
    const label = buildLocalityLabel(address);
    if (!label) continue;

    const key = normalizeRouteProComparableText(
      [label, address.province].filter(Boolean).join(" "),
    );
    if (!key) continue;

    const current = map.get(key);

    map.set(key, {
      label: current?.label ?? label,
      count: (current?.count ?? 0) + 1,
      province: current?.province ?? address.province,
      postalCodes: [
        ...(current?.postalCodes ?? []),
        address.postalCode,
      ],
    });
  }

  const total = parsedAddresses.length;

  return Array.from(map.entries())
    .map(([key, item]) => ({
      key,
      label: item.label,
      count: item.count,
      share: total > 0 ? item.count / total : 0,
      province: item.province,
      postalCodes: uniqueSorted(item.postalCodes),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, "it");
    });
}

function buildStreetContext(
  parsedAddresses: RouteProParsedAddress[],
): RouteProContextStreet[] {
  const map = new Map<
    string,
    {
      label: string;
      count: number;
      localities: Array<string | null>;
      houseNumbers: Array<string | null>;
    }
  >();

  for (const address of parsedAddresses) {
    if (!address.streetKey || !address.streetName) continue;

    const current = map.get(address.streetKey);

    map.set(address.streetKey, {
      label:
        current?.label ??
        [address.streetType, address.streetName]
          .filter(Boolean)
          .join(" "),
      count: (current?.count ?? 0) + 1,
      localities: [
        ...(current?.localities ?? []),
        buildLocalityLabel(address),
      ],
      houseNumbers: [
        ...(current?.houseNumbers ?? []),
        address.houseNumberNormalized,
      ],
    });
  }

  const total = parsedAddresses.length;

  return Array.from(map.entries())
    .map(([key, item]) => ({
      key,
      label: item.label,
      count: item.count,
      share: total > 0 ? item.count / total : 0,
      localities: uniqueSorted(item.localities),
      houseNumbers: uniqueSorted(item.houseNumbers),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, "it");
    });
}

function calculateRouteContextConfidence(params: {
  textual: RouteProTextualRouteContext;
  dominantLocality: RouteProContextLocality | null;
  dominantProvince: string | null;
}): number {
  let score = params.textual.averageAddressConfidence * 0.55;

  if (params.dominantLocality) {
    score += Math.min(25, params.dominantLocality.share * 35);
  }

  if (params.dominantProvince) {
    score += 12;
  }

  const unresolvedPenalty =
    params.textual.totalAddresses > 0
      ? (params.textual.unresolvedCount /
          params.textual.totalAddresses) *
        25
      : 0;

  return Math.max(
    0,
    Math.min(100, Math.round(score - unresolvedPenalty)),
  );
}

export function buildRouteProRouteContext(
  addresses: string[],
): RouteProRouteContext {
  const parsedAddresses = addresses.map(parseRouteProAddress);
  const textual = buildRouteProTextualContext(addresses);

  const localities = buildLocalityContext(parsedAddresses);
  const streets = buildStreetContext(parsedAddresses);

  const dominantLocality = localities[0] ?? null;
  const dominantProvince =
    textual.dominantProvinces[0]?.value ?? null;
  const dominantPostalCode =
    textual.dominantPostalCodes[0]?.value ?? null;

  const activeLocalities = localities.filter(
    (locality) => locality.count >= 2,
  );

  const sameLocalityRoute =
    Boolean(dominantLocality) &&
    (dominantLocality?.share ?? 0) >= 0.8;

  const multiLocalityRoute =
    activeLocalities.length >= 2 && !sameLocalityRoute;

  const confidence = calculateRouteContextConfidence({
    textual,
    dominantLocality,
    dominantProvince,
  });

  return {
    textual,
    parsedAddresses,
    dominantLocality,
    dominantProvince,
    dominantPostalCode,
    localities,
    streets,
    sameLocalityRoute,
    multiLocalityRoute,
    confidence,
  };
}

export function getRouteProContextQueryHints(
  context: RouteProRouteContext,
): string[] {
  const hints: string[] = [];

  if (context.dominantLocality?.label) {
    hints.push(context.dominantLocality.label);
  }

  if (context.dominantProvince) {
    hints.push(context.dominantProvince);
  }

  if (context.dominantPostalCode) {
    hints.push(context.dominantPostalCode);
  }

  hints.push("Italia");

  return Array.from(
    new Set(hints.map((hint) => hint.trim()).filter(Boolean)),
  );
}