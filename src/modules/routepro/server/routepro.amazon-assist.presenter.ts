import type { RouteProAmazonAssistReport } from "@/modules/routepro/server/routepro.routes";

export type RouteProAmazonAssistQuality =
  | "excellent"
  | "good"
  | "attention"
  | "critical";

export type RouteProAmazonAssistReadyStatus =
  | "ready"
  | "ready_with_attention"
  | "review_recommended";

export type RouteProAmazonAssistMetric = {
  key:
    | "corrections"
    | "moved_stops"
    | "distance_saved"
    | "time_saved";
  label: string;
  value: string;
  helper: string | null;
};

export type RouteProAmazonAssistCorrectionView = {
  id: string;
  type:
    | "street_revisit"
    | "nearby_stop_revisit"
    | "route_jump";
  typeLabel: string;
  description: string;
  previousPosition: number;
  nextPosition: number;
  movementLabel: string;
  savingMeters: number;
  savingLabel: string;
};

export type RouteProAmazonAssistDashboardModel = {
  generatedAt: string;
  method: string;

  originalScore: number;
  finalScore: number;
  scoreImprovement: number;
  scoreImprovementLabel: string;

  quality: RouteProAmazonAssistQuality;
  qualityLabel: string;
  stars: number;

  headline: string;
  summary: string;
  recommendationLabel: string;

  readyStatus: RouteProAmazonAssistReadyStatus;
  readyLabel: string;
  readyDescription: string;

  automationLabel: string;
  automationDescription: string;

  changed: boolean;
  correctionCount: number;
  changedStopCount: number;

  distanceSavedMeters: number;
  distanceSavedLabel: string;
  timeSavedSeconds: number;
  timeSavedLabel: string;

  originalAnomalies: number;
  finalAnomalies: number;
  anomaliesRemoved: number;

  streetRevisitsBefore: number;
  streetRevisitsAfter: number;
  nearbyRevisitsBefore: number;
  nearbyRevisitsAfter: number;
  routeJumpsBefore: number;
  routeJumpsAfter: number;

  metrics: RouteProAmazonAssistMetric[];
  corrections: RouteProAmazonAssistCorrectionView[];
  driverTips: string[];
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatAmazonAssistDistance(meters: number): string {
  const safeMeters = Math.max(0, Math.round(meters));

  if (safeMeters >= 1000) {
    return `${(safeMeters / 1000).toLocaleString("it-IT", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} km`;
  }

  return `${safeMeters.toLocaleString("it-IT")} m`;
}

export function formatAmazonAssistDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds} sec`;
}

function getQuality(score: number): {
  quality: RouteProAmazonAssistQuality;
  label: string;
  stars: number;
} {
  if (score >= 92) {
    return {
      quality: "excellent",
      label: "Percorso molto efficiente",
      stars: 5,
    };
  }

  if (score >= 80) {
    return {
      quality: "good",
      label: "Percorso ben organizzato",
      stars: 4,
    };
  }

  if (score >= 60) {
    return {
      quality: "attention",
      label: "Percorso migliorabile",
      stars: 3,
    };
  }

  return {
    quality: "critical",
    label: "Percorso da controllare",
    stars: 2,
  };
}

function getRecommendationLabel(
  recommendation:
    RouteProAmazonAssistReport["final_analysis"]["recommendation"],
): string {
  switch (recommendation) {
    case "no_change_recommended":
      return "Non sono consigliati ulteriori spostamenti automatici.";

    case "minor_corrections_available":
      return "Sono ancora possibili piccole correzioni, ma la rotta è utilizzabile.";

    case "optimization_recommended":
      return "Sono ancora presenti anomalie che meritano attenzione.";

    case "strong_optimization_recommended":
      return "La sequenza presenta anomalie importanti e dovrebbe essere controllata.";

    default:
      return "Analisi completata.";
  }
}

function getReadyStatus(
  score: number,
  finalAnomalies: number,
): {
  status: RouteProAmazonAssistReadyStatus;
  label: string;
  description: string;
} {
  if (score >= 80 && finalAnomalies <= 3) {
    return {
      status: "ready",
      label: "READY",
      description:
        "Il percorso è ottimizzato e pronto per il Driver Command Center.",
    };
  }

  if (score >= 60) {
    return {
      status: "ready_with_attention",
      label: "READY CON ATTENZIONE",
      description:
        "Puoi avviare la guida, ma RoutePro segnala alcune anomalie residue.",
    };
  }

  return {
    status: "review_recommended",
    label: "CONTROLLO CONSIGLIATO",
    description:
      "Prima di iniziare la guida è consigliato verificare la sequenza.",
  };
}

function getCorrectionTypeLabel(
  type:
    RouteProAmazonAssistReport["corrections"][number]["type"],
): string {
  switch (type) {
    case "street_revisit":
      return "Ritorno sulla stessa via";

    case "nearby_stop_revisit":
      return "Ritorno in una zona vicina";

    case "route_jump":
      return "Salto di percorso";

    default:
      return "Correzione della sequenza";
  }
}

function buildDriverTips(
  report: RouteProAmazonAssistReport,
  scoreImprovement: number,
): string[] {
  const tips: string[] = [];
  const finalCounts = report.final_analysis.counts;
  const originalCounts = report.original_analysis.counts;

  if (report.corrections.length === 0) {
    tips.push(
      "Amazon Assist non ha trovato spostamenti abbastanza sicuri e vantaggiosi da applicare.",
    );
  }

  if (
    originalCounts.streetRevisits > finalCounts.streetRevisits
  ) {
    const removed =
      originalCounts.streetRevisits - finalCounts.streetRevisits;

    tips.push(
      `${removed} ${
        removed === 1
          ? "ritorno sulla stessa via è stato eliminato"
          : "ritorni sulla stessa via sono stati eliminati"
      }.`,
    );
  }

  if (
    originalCounts.nearbyStopRevisits >
    finalCounts.nearbyStopRevisits
  ) {
    const removed =
      originalCounts.nearbyStopRevisits -
      finalCounts.nearbyStopRevisits;

    tips.push(
      `${removed} ${
        removed === 1
          ? "ritorno in una zona vicina è stato corretto"
          : "ritorni in zone vicine sono stati corretti"
      }.`,
    );
  }

  if (originalCounts.routeJumps > finalCounts.routeJumps) {
    const removed =
      originalCounts.routeJumps - finalCounts.routeJumps;

    tips.push(
      `${removed} ${
        removed === 1
          ? "salto di percorso è stato eliminato"
          : "salti di percorso sono stati eliminati"
      }.`,
    );
  }

  if (scoreImprovement > 0) {
    tips.push(
      `La qualità della sequenza è migliorata di ${scoreImprovement} ${
        scoreImprovement === 1 ? "punto" : "punti"
      }.`,
    );
  }

  if (finalCounts.total === 0) {
    tips.push(
      "Non risultano anomalie residue nella sequenza analizzata.",
    );
  } else if (finalCounts.total <= 3) {
    tips.push(
      "Le anomalie residue sono limitate: evita modifiche manuali non necessarie.",
    );
  } else {
    tips.push(
      "Controlla le anomalie residue prima di avviare la navigazione.",
    );
  }

  return tips.slice(0, 4);
}

export function buildAmazonAssistDashboard(
  report: RouteProAmazonAssistReport,
): RouteProAmazonAssistDashboardModel {
  const originalScore = clampScore(
    report.original_analysis.routeScore,
  );

  const finalScore = clampScore(
    report.final_analysis.routeScore,
  );

  const scoreImprovement = Math.max(
    0,
    finalScore - originalScore,
  );

  const originalAnomalies = Math.max(
    0,
    report.original_analysis.counts.total,
  );

  const finalAnomalies = Math.max(
    0,
    report.final_analysis.counts.total,
  );

  const anomaliesRemoved = Math.max(
    0,
    originalAnomalies - finalAnomalies,
  );

  const quality = getQuality(finalScore);
  const ready = getReadyStatus(finalScore, finalAnomalies);

  const distanceSavedMeters = Math.max(
    0,
    Math.round(report.applied_saving_meters),
  );

  const timeSavedSeconds = Math.max(
    0,
    Math.round(report.applied_saving_seconds),
  );

  const corrections =
    report.corrections.map((correction, index) => {
      const previousPosition =
        Math.max(0, correction.previousIndex) + 1;

      const nextPosition =
        Math.max(0, correction.nextIndex) + 1;

      return {
        id: `${correction.stopId}-${index}`,
        type: correction.type,
        typeLabel: getCorrectionTypeLabel(correction.type),
        description: correction.description,
        previousPosition,
        nextPosition,
        movementLabel: `${previousPosition} → ${nextPosition}`,
        savingMeters: Math.max(
          0,
          Math.round(correction.savingMeters),
        ),
        savingLabel: formatAmazonAssistDistance(
          correction.savingMeters,
        ),
      };
    });

  const headline =
    scoreImprovement > 0
      ? `RoutePro ha migliorato la sequenza di ${scoreImprovement} ${
          scoreImprovement === 1 ? "punto" : "punti"
        }.`
      : report.changed
        ? "RoutePro ha applicato correzioni conservative alla sequenza."
        : "La sequenza originale è stata preservata.";

  const summary =
    anomaliesRemoved > 0
      ? `${anomaliesRemoved} ${
          anomaliesRemoved === 1
            ? "anomalia è stata eliminata"
            : "anomalie sono state eliminate"
        } senza modificare partenza e rientro.`
      : finalAnomalies === 0
        ? "La sequenza analizzata non presenta anomalie residue."
        : "Non sono stati applicati spostamenti privi di un vantaggio geometrico sufficiente.";

  const metrics: RouteProAmazonAssistMetric[] = [
    {
      key: "corrections",
      label: "Correzioni applicate",
      value: report.corrections.length.toLocaleString("it-IT"),
      helper:
        report.corrections.length === 1
          ? "1 intervento conservativo"
          : `${report.corrections.length.toLocaleString("it-IT")} interventi conservativi`,
    },
    {
      key: "moved_stops",
      label: "Stop riposizionati",
      value: Math.max(
        0,
        report.changed_stop_count,
      ).toLocaleString("it-IT"),
      helper: "Partenza e rientro esclusi",
    },
    {
      key: "distance_saved",
      label: "Distanza evitata",
      value: formatAmazonAssistDistance(distanceSavedMeters),
      helper: "Stima geometrica",
    },
    {
      key: "time_saved",
      label: "Tempo stimato",
      value: formatAmazonAssistDuration(timeSavedSeconds),
      helper: "Stima RoutePro",
    },
  ];

  return {
    generatedAt: report.generated_at,
    method: report.method,

    originalScore,
    finalScore,
    scoreImprovement,
    scoreImprovementLabel:
      scoreImprovement > 0
        ? `+${scoreImprovement}`
        : "Nessuna variazione",

    quality: quality.quality,
    qualityLabel: quality.label,
    stars: quality.stars,

    headline,
    summary,
    recommendationLabel: getRecommendationLabel(
      report.final_analysis.recommendation,
    ),

    readyStatus: ready.status,
    readyLabel: ready.label,
    readyDescription: ready.description,

    automationLabel: "Ottimizzazione conservativa",
    automationDescription:
      "RoutePro applica solo spostamenti con un risparmio geometrico misurabile e mantiene fissi partenza e rientro.",

    changed: report.changed,
    correctionCount: report.corrections.length,
    changedStopCount: Math.max(
      0,
      report.changed_stop_count,
    ),

    distanceSavedMeters,
    distanceSavedLabel:
      formatAmazonAssistDistance(distanceSavedMeters),
    timeSavedSeconds,
    timeSavedLabel:
      formatAmazonAssistDuration(timeSavedSeconds),

    originalAnomalies,
    finalAnomalies,
    anomaliesRemoved,

    streetRevisitsBefore:
      report.original_analysis.counts.streetRevisits,
    streetRevisitsAfter:
      report.final_analysis.counts.streetRevisits,
    nearbyRevisitsBefore:
      report.original_analysis.counts.nearbyStopRevisits,
    nearbyRevisitsAfter:
      report.final_analysis.counts.nearbyStopRevisits,
    routeJumpsBefore:
      report.original_analysis.counts.routeJumps,
    routeJumpsAfter:
      report.final_analysis.counts.routeJumps,

    metrics,
    corrections,
    driverTips: buildDriverTips(
      report,
      scoreImprovement,
    ),
  };
}
