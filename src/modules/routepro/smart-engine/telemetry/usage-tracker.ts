/**
 * RPSE-012B — Smart Engine Usage Tracker v1.1
 *
 * One entry = one geocoded stop/address.
 * Provider request counters are stored separately so fallback does not
 * incorrectly inflate totalStops.
 */

export type SmartProvider =
  | "cache"
  | "mapbox"
  | "ors"
  | "manual"
  | "none";

export type SmartResult =
  | "success"
  | "fallback"
  | "review";

export interface SmartUsageEntry {
  provider: SmartProvider;
  durationMs: number;
  confidence: number | null;
  result: SmartResult;

  cacheHit?: boolean;
  mapboxRequests?: number;
  orsRequests?: number;
}

export interface SmartUsageReport {
  totalStops: number;

  cacheHits: number;
  mapboxRequests: number;
  orsRequests: number;
  manualReviews: number;

  successfulStops: number;
  fallbackStops: number;

  totalDurationMs: number;
  averageDurationMs: number;

  estimatedCostUsd: number;
}

export const SMART_USAGE_COSTS = {
  mapboxPerRequestUsd: 0.005,
  orsPerRequestUsd: 0,
  cachePerRequestUsd: 0,
} as const;

export class SmartUsageTracker {
  private readonly entries: SmartUsageEntry[] = [];

  add(entry: SmartUsageEntry): void {
    this.entries.push({
      ...entry,
      durationMs: Math.max(0, Math.round(entry.durationMs)),
      mapboxRequests: Math.max(
        0,
        Math.round(entry.mapboxRequests ?? 0),
      ),
      orsRequests: Math.max(
        0,
        Math.round(entry.orsRequests ?? 0),
      ),
    });
  }

  getEntries(): readonly SmartUsageEntry[] {
    return [...this.entries];
  }

  reset(): void {
    this.entries.length = 0;
  }

  buildReport(): SmartUsageReport {
    const totalStops = this.entries.length;

    const cacheHits = this.entries.filter(
      (entry) => entry.cacheHit || entry.provider === "cache",
    ).length;

    const mapboxRequests = this.entries.reduce(
      (sum, entry) => sum + (entry.mapboxRequests ?? 0),
      0,
    );

    const orsRequests = this.entries.reduce(
      (sum, entry) => sum + (entry.orsRequests ?? 0),
      0,
    );

    const manualReviews = this.entries.filter(
      (entry) => entry.result === "review",
    ).length;

    const successfulStops = this.entries.filter(
      (entry) => entry.result === "success",
    ).length;

    const fallbackStops = this.entries.filter(
      (entry) => entry.result === "fallback",
    ).length;

    const totalDurationMs = this.entries.reduce(
      (sum, entry) => sum + entry.durationMs,
      0,
    );

    const estimatedCostUsd =
      mapboxRequests *
        SMART_USAGE_COSTS.mapboxPerRequestUsd +
      orsRequests *
        SMART_USAGE_COSTS.orsPerRequestUsd +
      cacheHits *
        SMART_USAGE_COSTS.cachePerRequestUsd;

    return {
      totalStops,
      cacheHits,
      mapboxRequests,
      orsRequests,
      manualReviews,
      successfulStops,
      fallbackStops,
      totalDurationMs,
      averageDurationMs:
        totalStops === 0
          ? 0
          : Math.round(totalDurationMs / totalStops),
      estimatedCostUsd:
        Math.round(estimatedCostUsd * 100000) / 100000,
    };
  }
}