import type { RouteProAiRecoveryPlan } from "@/modules/routepro/types/routepro.ai-recovery.types";

export type RouteProAiStopConfidence =
  | "high"
  | "medium"
  | "low"
  | "needs_review";

export type RouteProAiImportMethod = "manual" | "csv" | "ai_screenshot";

export type RouteProAiExtractedStop = {
  originalStopNumber: number;

  // Clean deliverable address extracted from the screenshot.
  // Kept for compatibility with the current RoutePro workflow.
  addressRaw: string;

  // Geographic interpretation produced by AI for later geocoding.
  interpretedAddress?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  locality?: string | null;
  municipality?: string | null;
  province?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  interpretationConfidence?: number | null;

  // Backward-compatible field. Prefer municipality, then locality.
  city: string | null;

  confidence: RouteProAiStopConfidence;
  isPlaceholder: boolean;
  needsReviewReason?: string | null;
};

export type RouteProAiImportSummary = {
  totalFound: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  needsReview: number;
  placeholders: number;
  missing: number;
};

export type RouteProAiImportBatchSummary = {
  batchIndex: number;
  batchTotal: number;
  fileNames: string[];
  extractedStops: number;
};

export type RouteProAiImportPreview = {
  importId: string;
  summary: RouteProAiImportSummary;
  batchSummaries: RouteProAiImportBatchSummary[];
  stops: RouteProAiExtractedStop[];
  recoveryPlan: RouteProAiRecoveryPlan;
  canCreateRoute: boolean;
  canOptimize: boolean;
  blockingReason: string | null;
};