import type { RouteProAiRecoveryPlan } from "@/modules/routepro/types/routepro.ai-recovery.types";

export type RouteProAiStopConfidence =
  | "high"
  | "medium"
  | "low"
  | "needs_review";

export type RouteProAiImportMethod = "manual" | "csv" | "ai_screenshot";

export type RouteProAiExtractedStop = {
  originalStopNumber: number;
  addressRaw: string;
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