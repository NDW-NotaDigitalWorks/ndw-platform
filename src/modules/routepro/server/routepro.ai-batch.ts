import { extractRouteProStopsWithOpenAiVision } from "@/modules/routepro/server/routepro.ai-openai";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const ROUTEPRO_AI_SCREENSHOTS_PER_BATCH = 5;
export const ROUTEPRO_AI_BATCH_CONCURRENCY = 3;
export const ROUTEPRO_AI_BATCH_MAX_RETRIES = 2;

const ROUTEPRO_AI_SERVICE_ERROR_MESSAGE =
  "Il servizio AI di RoutePro è temporaneamente non disponibile. Riprova tra qualche minuto.";

export type RouteProAiBatchResult = {
  batchIndex: number;
  batchTotal: number;
  fileNames: string[];
  stops: RouteProAiExtractedStop[];
  error: string | null;
};

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];

  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }

  return chunks;
}

function scoreStop(stop: RouteProAiExtractedStop): number {
  let score = 0;

  if (!stop.isPlaceholder && stop.confidence === "high") score += 400;
  else if (!stop.isPlaceholder && stop.confidence === "medium") score += 300;
  else if (!stop.isPlaceholder && stop.confidence === "low") score += 200;
  else if (stop.isPlaceholder) score += 100;

  // A parita di qualita OCR, preferisci l'interpretazione geografica piu ricca.
  if (stop.interpretedAddress) score += 20;
  if (stop.street) score += 8;
  if (stop.houseNumber) score += 6;
  if (stop.locality) score += 5;
  if (stop.municipality) score += 8;
  if (stop.province) score += 3;
  if (stop.postalCode) score += 2;
  if (stop.countryCode) score += 1;

  if (
    typeof stop.interpretationConfidence === "number" &&
    Number.isFinite(stop.interpretationConfidence)
  ) {
    score += Math.round(
      Math.min(
        1,
        Math.max(0, stop.interpretationConfidence),
      ) * 20,
    );
  }

  return score;
}

function isNonRetryableOpenAiError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("insufficient_quota") ||
    normalized.includes("organization_usage_limit_exceeded") ||
    normalized.includes("organization_spend_limit_exceeded") ||
    normalized.includes("project_spend_limit_exceeded") ||
    normalized.includes("invalid_api_key") ||
    normalized.includes("incorrect api key") ||
    normalized.includes("invalid authentication")
  );
}

async function analyzeBatchWithRetry(
  batchFiles: File[],
  batchIndex: number,
  batchTotal: number,
): Promise<RouteProAiBatchResult> {
  let lastError: string | null = null;

  for (
    let attempt = 1;
    attempt <= ROUTEPRO_AI_BATCH_MAX_RETRIES + 1;
    attempt += 1
  ) {
    try {
      const stops =
        await extractRouteProStopsWithOpenAiVision(batchFiles);

      return {
        batchIndex,
        batchTotal,
        fileNames: batchFiles.map(
          (file) => file.name,
        ),
        stops,
        error: null,
      };
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : `Errore batch ${batchIndex}, tentativo ${attempt}`;

      console.error("RoutePro AI batch error:", {
        batchIndex,
        batchTotal,
        attempt,
        fileNames: batchFiles.map(
          (file) => file.name,
        ),
        error: lastError,
      });

      /*
       * Errori di configurazione / credito / quota non migliorano
       * effettuando altri tentativi immediati.
       *
       * Li fermiamo subito, evitando chiamate inutili.
       */
      if (isNonRetryableOpenAiError(lastError)) {
        throw new Error(
          ROUTEPRO_AI_SERVICE_ERROR_MESSAGE,
        );
      }
    }
  }

  /*
   * GO LIVE SAFETY:
   *
   * Non permettiamo mai che un batch fallito venga trasformato
   * silenziosamente in "0 stop".
   *
   * Una rotta parziale potrebbe far perdere consegne visibili
   * negli screenshot. Se tutti i retry di un batch falliscono,
   * fermiamo quindi l'intera analisi.
   */
  console.error(
    "RoutePro AI batch failed after all retries:",
    {
      batchIndex,
      batchTotal,
      fileNames: batchFiles.map(
        (file) => file.name,
      ),
      error: lastError,
    },
  );

  throw new Error(
    ROUTEPRO_AI_SERVICE_ERROR_MESSAGE,
  );
}

export function mergeRouteProAiBatchStops(
  batchResults: RouteProAiBatchResult[],
): RouteProAiExtractedStop[] {
  const merged = new Map<
    number,
    RouteProAiExtractedStop
  >();

  for (const batch of batchResults) {
    for (const stop of batch.stops) {
      const existing = merged.get(
        stop.originalStopNumber,
      );

      if (!existing) {
        merged.set(
          stop.originalStopNumber,
          stop,
        );
        continue;
      }

      if (scoreStop(stop) > scoreStop(existing)) {
        merged.set(
          stop.originalStopNumber,
          stop,
        );
      }
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) =>
      a.originalStopNumber -
      b.originalStopNumber,
  );
}

export async function extractRouteProStopsWithOpenAiVisionBatches(
  files: File[],
): Promise<{
  batchResults: RouteProAiBatchResult[];
  mergedStops: RouteProAiExtractedStop[];
}> {
  const batches = chunkFiles(
    files,
    ROUTEPRO_AI_SCREENSHOTS_PER_BATCH,
  );

  const batchResults: RouteProAiBatchResult[] = [];

  for (
    let index = 0;
    index < batches.length;
    index += ROUTEPRO_AI_BATCH_CONCURRENCY
  ) {
    const batchGroup = batches.slice(
      index,
      index + ROUTEPRO_AI_BATCH_CONCURRENCY,
    );

    const groupResults = await Promise.all(
      batchGroup.map(
        (batchFiles, groupIndex) =>
          analyzeBatchWithRetry(
            batchFiles,
            index + groupIndex + 1,
            batches.length,
          ),
      ),
    );

    batchResults.push(...groupResults);
  }

  const sortedResults = batchResults.sort(
    (a, b) => a.batchIndex - b.batchIndex,
  );

  return {
    batchResults: sortedResults,
    mergedStops:
      mergeRouteProAiBatchStops(sortedResults),
  };
}