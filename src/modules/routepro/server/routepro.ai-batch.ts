import { extractRouteProStopsWithOpenAiVision } from "@/modules/routepro/server/routepro.ai-openai";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const ROUTEPRO_AI_SCREENSHOTS_PER_BATCH = 5;
export const ROUTEPRO_AI_BATCH_CONCURRENCY = 3;
export const ROUTEPRO_AI_BATCH_MAX_RETRIES = 2;

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
      Math.min(1, Math.max(0, stop.interpretationConfidence)) * 20,
    );
  }

  return score;
}

async function analyzeBatchWithRetry(
  batchFiles: File[],
  batchIndex: number,
  batchTotal: number,
): Promise<RouteProAiBatchResult> {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= ROUTEPRO_AI_BATCH_MAX_RETRIES + 1; attempt += 1) {
    try {
      const stops = await extractRouteProStopsWithOpenAiVision(batchFiles);

      return {
        batchIndex,
        batchTotal,
        fileNames: batchFiles.map((file) => file.name),
        stops,
        error: null,
      };
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : `Errore batch ${batchIndex}, tentativo ${attempt}`;
    }
  }

  return {
    batchIndex,
    batchTotal,
    fileNames: batchFiles.map((file) => file.name),
    stops: [],
    error: lastError,
  };
}

export function mergeRouteProAiBatchStops(
  batchResults: RouteProAiBatchResult[],
): RouteProAiExtractedStop[] {
  const merged = new Map<number, RouteProAiExtractedStop>();

  for (const batch of batchResults) {
    for (const stop of batch.stops) {
      const existing = merged.get(stop.originalStopNumber);

      if (!existing) {
        merged.set(stop.originalStopNumber, stop);
        continue;
      }

      if (scoreStop(stop) > scoreStop(existing)) {
        merged.set(stop.originalStopNumber, stop);
      }
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );
}

export async function extractRouteProStopsWithOpenAiVisionBatches(
  files: File[],
): Promise<{
  batchResults: RouteProAiBatchResult[];
  mergedStops: RouteProAiExtractedStop[];
}> {
  const batches = chunkFiles(files, ROUTEPRO_AI_SCREENSHOTS_PER_BATCH);
  const batchResults: RouteProAiBatchResult[] = [];

  for (let index = 0; index < batches.length; index += ROUTEPRO_AI_BATCH_CONCURRENCY) {
    const batchGroup = batches.slice(index, index + ROUTEPRO_AI_BATCH_CONCURRENCY);

    const groupResults = await Promise.all(
      batchGroup.map((batchFiles, groupIndex) =>
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
    mergedStops: mergeRouteProAiBatchStops(sortedResults),
  };
}