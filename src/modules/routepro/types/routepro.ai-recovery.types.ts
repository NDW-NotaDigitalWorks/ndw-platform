export type RouteProAiMissingStop = {
  stopNumber: number;
  reason: "gap_detected" | "placeholder" | "low_confidence";
  batchHint: {
    previousStopNumber: number | null;
    nextStopNumber: number | null;
    suggestedScreenshotWindow: {
      fromIndex: number | null;
      toIndex: number | null;
    };
  };
};

export type RouteProAiRecoveryPlan = {
  enabled: boolean;
  missingStops: RouteProAiMissingStop[];
  totalMissingStops: number;
  canAttemptRecovery: boolean;
};