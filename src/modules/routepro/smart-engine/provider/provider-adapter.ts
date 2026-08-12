/**
 * RPSE-004 — Smart Provider Adapter v1
 *
 * Pure TypeScript provider orchestration:
 * - progressive query execution
 * - timeout
 * - retry with exponential backoff
 * - 429 handling
 * - unified provider result format
 *
 * This module does not know OpenRouteService, Supabase, React or Next.js.
 */

export const ROUTEPRO_PROVIDER_ADAPTER_VERSION = "1.0.0";

export type RouteProProviderName =
  | "openrouteservice"
  | "here"
  | "google"
  | "tomtom"
  | "mapbox"
  | "custom";

export type RouteProProviderCandidate = {
  provider: RouteProProviderName;
  providerCandidateId?: string | null;
  label: string | null;
  lat: number;
  lng: number;
  confidence: number | null;
  layer: string | null;
  street: string | null;
  houseNumber: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  raw?: unknown;
};

export type RouteProProviderRequestContext = {
  query: string;
  attempt: number;
  queryIndex: number;
  signal: AbortSignal;
};

export type RouteProProviderRequestResult =
  | {
      ok: true;
      status: number;
      candidates: RouteProProviderCandidate[];
    }
  | {
      ok: false;
      status: number | null;
      retryable: boolean;
      message: string;
    };

export type RouteProProviderExecutor = (
  context: RouteProProviderRequestContext,
) => Promise<RouteProProviderRequestResult>;

export type RouteProProviderAdapterOptions = {
  timeoutMs?: number;
  maxAttemptsPerQuery?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  stopOnFirstCandidateSet?: boolean;
  maxQueries?: number;
};

export type RouteProProviderAttemptTrace = {
  query: string;
  queryIndex: number;
  attempt: number;
  startedAt: string;
  durationMs: number;
  status: number | null;
  ok: boolean;
  retryable: boolean;
  candidateCount: number;
  message: string | null;
};

export type RouteProProviderAdapterResult = {
  version: string;
  ok: boolean;
  provider: RouteProProviderName;
  candidates: RouteProProviderCandidate[];
  successfulQuery: string | null;
  attemptedQueries: string[];
  traces: RouteProProviderAttemptTrace[];
  totalDurationMs: number;
  totalAttempts: number;
  rateLimitedAttempts: number;
  timeoutAttempts: number;
  error: string | null;
};

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ATTEMPTS_PER_QUERY = 3;
const DEFAULT_INITIAL_BACKOFF_MS = 700;
const DEFAULT_MAX_BACKOFF_MS = 4_000;
const DEFAULT_MAX_QUERIES = 5;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function uniqueQueries(queries: string[], maxQueries: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const query of queries) {
    const clean = query.replace(/\s+/g, " ").trim();
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    output.push(clean);

    if (output.length >= maxQueries) {
      break;
    }
  }

  return output;
}

function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort(
      new DOMException("Provider request timed out.", "TimeoutError"),
    );
  }, timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function calculateBackoffMs(
  attempt: number,
  initialBackoffMs: number,
  maxBackoffMs: number,
): number {
  const exponential = initialBackoffMs * 2 ** Math.max(0, attempt - 1);
  const jitter = Math.round(Math.random() * 250);

  return Math.min(maxBackoffMs, exponential + jitter);
}

function candidateIdentity(
  candidate: RouteProProviderCandidate,
): string {
  return [
    candidate.provider,
    candidate.providerCandidateId ?? "",
    candidate.lat.toFixed(7),
    candidate.lng.toFixed(7),
    candidate.label ?? "",
  ].join("|");
}

function mergeCandidates(
  current: RouteProProviderCandidate[],
  incoming: RouteProProviderCandidate[],
): RouteProProviderCandidate[] {
  const map = new Map<string, RouteProProviderCandidate>();

  for (const candidate of [...current, ...incoming]) {
    if (
      !Number.isFinite(candidate.lat) ||
      !Number.isFinite(candidate.lng)
    ) {
      continue;
    }

    const key = candidateIdentity(candidate);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, candidate);
      continue;
    }

    const existingConfidence = existing.confidence ?? -1;
    const incomingConfidence = candidate.confidence ?? -1;

    if (incomingConfidence > existingConfidence) {
      map.set(key, candidate);
    }
  }

  return Array.from(map.values());
}

export async function runRouteProProviderAdapter(params: {
  provider: RouteProProviderName;
  queries: string[];
  execute: RouteProProviderExecutor;
  options?: RouteProProviderAdapterOptions;
}): Promise<RouteProProviderAdapterResult> {
  const options = params.options ?? {};

  const timeoutMs = Math.max(
    1_000,
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  const maxAttemptsPerQuery = Math.max(
    1,
    options.maxAttemptsPerQuery ??
      DEFAULT_MAX_ATTEMPTS_PER_QUERY,
  );

  const initialBackoffMs = Math.max(
    100,
    options.initialBackoffMs ??
      DEFAULT_INITIAL_BACKOFF_MS,
  );

  const maxBackoffMs = Math.max(
    initialBackoffMs,
    options.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS,
  );

  const stopOnFirstCandidateSet =
    options.stopOnFirstCandidateSet ?? true;

  const maxQueries = Math.max(
    1,
    options.maxQueries ?? DEFAULT_MAX_QUERIES,
  );

  const queries = uniqueQueries(params.queries, maxQueries);
  const startedAt = Date.now();

  const traces: RouteProProviderAttemptTrace[] = [];
  let candidates: RouteProProviderCandidate[] = [];
  let successfulQuery: string | null = null;
  let totalAttempts = 0;
  let rateLimitedAttempts = 0;
  let timeoutAttempts = 0;
  let lastError: string | null = null;

  for (
    let queryIndex = 0;
    queryIndex < queries.length;
    queryIndex += 1
  ) {
    const query = queries[queryIndex];

    for (
      let attempt = 1;
      attempt <= maxAttemptsPerQuery;
      attempt += 1
    ) {
      totalAttempts += 1;

      const attemptStartedAt = new Date().toISOString();
      const attemptStartMs = Date.now();
      const timeout = createTimeoutSignal(timeoutMs);

      let result: RouteProProviderRequestResult;

      try {
        result = await params.execute({
          query,
          attempt,
          queryIndex,
          signal: timeout.signal,
        });
      } catch (error) {
        const aborted = timeout.signal.aborted;

        if (aborted) {
          timeoutAttempts += 1;
        }

        result = {
          ok: false,
          status: null,
          retryable: aborted,
          message:
            error instanceof Error
              ? error.message
              : "Provider request failed.",
        };
      } finally {
        timeout.clear();
      }

      const durationMs = Date.now() - attemptStartMs;

      if (result.ok) {
        candidates = mergeCandidates(
          candidates,
          result.candidates,
        );

        traces.push({
          query,
          queryIndex,
          attempt,
          startedAt: attemptStartedAt,
          durationMs,
          status: result.status,
          ok: true,
          retryable: false,
          candidateCount: result.candidates.length,
          message: null,
        });

        if (result.candidates.length > 0) {
          successfulQuery = successfulQuery ?? query;

          if (stopOnFirstCandidateSet) {
            return {
              version: ROUTEPRO_PROVIDER_ADAPTER_VERSION,
              ok: true,
              provider: params.provider,
              candidates,
              successfulQuery,
              attemptedQueries: queries.slice(0, queryIndex + 1),
              traces,
              totalDurationMs: Date.now() - startedAt,
              totalAttempts,
              rateLimitedAttempts,
              timeoutAttempts,
              error: null,
            };
          }
        }

        break;
      }

      lastError = result.message;

      if (result.status === 429) {
        rateLimitedAttempts += 1;
      }

      traces.push({
        query,
        queryIndex,
        attempt,
        startedAt: attemptStartedAt,
        durationMs,
        status: result.status,
        ok: false,
        retryable: result.retryable,
        candidateCount: 0,
        message: result.message,
      });

      const canRetry =
        result.retryable &&
        attempt < maxAttemptsPerQuery;

      if (!canRetry) {
        break;
      }

      await sleep(
        calculateBackoffMs(
          attempt,
          initialBackoffMs,
          maxBackoffMs,
        ),
      );
    }
  }

  return {
    version: ROUTEPRO_PROVIDER_ADAPTER_VERSION,
    ok: candidates.length > 0,
    provider: params.provider,
    candidates,
    successfulQuery,
    attemptedQueries: queries,
    traces,
    totalDurationMs: Date.now() - startedAt,
    totalAttempts,
    rateLimitedAttempts,
    timeoutAttempts,
    error:
      candidates.length > 0
        ? null
        : lastError ?? "No provider candidates found.",
  };
}