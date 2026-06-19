import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";
import type {
  RouteProAiMissingStop,
  RouteProAiRecoveryPlan,
} from "@/modules/routepro/types/routepro.ai-recovery.types";

function buildScreenshotWindow(stopNumber: number): {
  fromIndex: number | null;
  toIndex: number | null;
} {
  const estimatedScreenshotIndex = Math.max(1, Math.ceil(stopNumber / 3));

  return {
    fromIndex: Math.max(1, estimatedScreenshotIndex - 2),
    toIndex: estimatedScreenshotIndex + 2,
  };
}

export function buildRouteProAiRecoveryPlan(
  stops: RouteProAiExtractedStop[],
): RouteProAiRecoveryPlan {
  const sortedStops = [...stops].sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );

  const missingStops: RouteProAiMissingStop[] = [];

  for (let index = 0; index < sortedStops.length - 1; index += 1) {
    const current = sortedStops[index];
    const next = sortedStops[index + 1];

    const gap = next.originalStopNumber - current.originalStopNumber;

    if (gap <= 1) {
      continue;
    }

    for (
      let missingStopNumber = current.originalStopNumber + 1;
      missingStopNumber < next.originalStopNumber;
      missingStopNumber += 1
    ) {
      missingStops.push({
        stopNumber: missingStopNumber,
        reason: "gap_detected",
        batchHint: {
          previousStopNumber: current.originalStopNumber,
          nextStopNumber: next.originalStopNumber,
          suggestedScreenshotWindow: buildScreenshotWindow(missingStopNumber),
        },
      });
    }
  }

  for (const stop of sortedStops) {
    if (stop.isPlaceholder) {
      missingStops.push({
        stopNumber: stop.originalStopNumber,
        reason: "placeholder",
        batchHint: {
          previousStopNumber: stop.originalStopNumber - 1 || null,
          nextStopNumber: stop.originalStopNumber + 1,
          suggestedScreenshotWindow: buildScreenshotWindow(stop.originalStopNumber),
        },
      });
    }

    if (stop.confidence === "low" || stop.confidence === "needs_review") {
      missingStops.push({
        stopNumber: stop.originalStopNumber,
        reason: "low_confidence",
        batchHint: {
          previousStopNumber: stop.originalStopNumber - 1 || null,
          nextStopNumber: stop.originalStopNumber + 1,
          suggestedScreenshotWindow: buildScreenshotWindow(stop.originalStopNumber),
        },
      });
    }
  }

  const uniqueMissingStops = Array.from(
    new Map(missingStops.map((item) => [item.stopNumber, item])).values(),
  ).sort((a, b) => a.stopNumber - b.stopNumber);

  return {
    enabled: false,
    missingStops: uniqueMissingStops,
    totalMissingStops: uniqueMissingStops.length,
    canAttemptRecovery: uniqueMissingStops.length > 0,
  };
}