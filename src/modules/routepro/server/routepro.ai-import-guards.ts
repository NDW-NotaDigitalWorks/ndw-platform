import type {
  RouteProAiExtractedStop,
  RouteProAiImportSummary,
} from "@/modules/routepro/types/routepro.ai-import.types";

export function buildAiImportSummary(
  stops: RouteProAiExtractedStop[],
  expectedStopsCount?: number | null,
): RouteProAiImportSummary {
  const highConfidence = stops.filter((stop) => stop.confidence === "high").length;
  const mediumConfidence = stops.filter((stop) => stop.confidence === "medium").length;
  const lowConfidence = stops.filter((stop) => stop.confidence === "low").length;
  const needsReview = stops.filter(
    (stop) => stop.confidence === "needs_review",
  ).length;
  const placeholders = stops.filter((stop) => stop.isPlaceholder).length;

  const totalFound = stops.length;

  const missing =
    typeof expectedStopsCount === "number" && expectedStopsCount > totalFound
      ? expectedStopsCount - totalFound
      : placeholders;

  return {
    totalFound,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    needsReview,
    placeholders,
    missing,
  };
}

export function getAiImportOptimizationBlockReason(
  summary: RouteProAiImportSummary,
): string | null {
  if (summary.placeholders > 0) {
    return "Correggi gli stop mancanti prima di ottimizzare la rotta.";
  }

  if (summary.missing > 0) {
    return "Correggi gli stop mancanti prima di ottimizzare la rotta.";
  }

  return null;
}