import { extractRouteProStopsWithOpenAiVision } from "@/modules/routepro/server/routepro.ai-openai";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const ROUTEPRO_AI_SCREENSHOTS_PER_BATCH = 5;

export type RouteProAiBatchResult = {
  batchIndex: number;
  batchTotal: number;
  fileNames: string[];
  stops: RouteProAiExtractedStop[];
};

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];

  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }

  return chunks;
}

function scoreStop(stop: RouteProAiExtractedStop): number {
  if (!stop.isPlaceholder && stop.confidence === "high") return 4;
  if (!stop.isPlaceholder && stop.confidence === "medium") return 3;
  if (!stop.isPlaceholder && stop.confidence === "low") return 2;
  if (stop.isPlaceholder) return 1;

  return 0;
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

  for (let index = 0; index < batches.length; index += 1) {
    const batchFiles = batches[index];

    const stops = await extractRouteProStopsWithOpenAiVision(batchFiles);

    batchResults.push({
      batchIndex: index + 1,
      batchTotal: batches.length,
      fileNames: batchFiles.map((file) => file.name),
      stops,
    });
  }

  return {
    batchResults,
    mergedStops: mergeRouteProAiBatchStops(batchResults),
  };
}