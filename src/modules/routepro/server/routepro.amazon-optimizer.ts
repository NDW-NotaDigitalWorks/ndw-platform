import {
  analyzeAmazonRoute,
  sortAmazonStopsByOriginalSequence,
  type AmazonAssistAnalysisResult,
  type AmazonAssistAnomaly,
  type AmazonAssistPoint,
  type AmazonAssistStop,
} from "@/modules/routepro/server/routepro.amazon-analysis";

type AmazonAssistStopWithRole = AmazonAssistStop & {
  stop_role?: "start" | "delivery" | "return";
};

export type AmazonAssistAppliedCorrection = {
  type: AmazonAssistAnomaly["type"];
  stopId: string;
  anchorStopId: string | null;
  previousIndex: number;
  nextIndex: number;
  savingMeters: number;
  description: string;
};

export type AmazonAssistResult = {
  orderedStops: AmazonAssistStopWithRole[];
  originalAnalysis: AmazonAssistAnalysisResult;
  analysis: AmazonAssistAnalysisResult;
  corrections: AmazonAssistAppliedCorrection[];
  changed: boolean;
  changedStopCount: number;
  appliedSavingMeters: number;
  appliedSavingSeconds: number;
  method: "amazon_assist_v1_conservative_corrections";
};

const MAX_AUTOMATIC_CORRECTIONS = 12;
const MIN_REVISIT_SAVING_METERS = 120;
const MIN_ROUTE_JUMP_SAVING_METERS = 250;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(
  first: AmazonAssistPoint,
  second: AmazonAssistPoint,
): number {
  const earthRadiusMeters = 6371000;

  const latitudeDifference = toRadians(second.lat - first.lat);
  const longitudeDifference = toRadians(second.lng - first.lng);

  const firstLatitude = toRadians(first.lat);
  const secondLatitude = toRadians(second.lat);

  const latitudeValue = Math.sin(latitudeDifference / 2);
  const longitudeValue = Math.sin(longitudeDifference / 2);

  const haversineValue =
    latitudeValue * latitudeValue +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      longitudeValue *
      longitudeValue;

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(
      Math.sqrt(haversineValue),
      Math.sqrt(1 - haversineValue),
    )
  );
}

function calculateSequenceDistanceMeters(
  stops: AmazonAssistStopWithRole[],
  startPoint?: AmazonAssistPoint | null,
  endPoint?: AmazonAssistPoint | null,
): number {
  if (stops.length === 0) {
    if (startPoint && endPoint) {
      return getDistanceMeters(startPoint, endPoint);
    }

    return 0;
  }

  let totalMeters = 0;

  if (startPoint) {
    totalMeters += getDistanceMeters(startPoint, stops[0]);
  }

  for (let index = 1; index < stops.length; index += 1) {
    totalMeters += getDistanceMeters(stops[index - 1], stops[index]);
  }

  if (endPoint) {
    totalMeters += getDistanceMeters(
      stops[stops.length - 1],
      endPoint,
    );
  }

  return totalMeters;
}

function moveStopToIndex(
  stops: AmazonAssistStopWithRole[],
  stopId: string,
  insertionIndex: number,
): AmazonAssistStopWithRole[] | null {
  const currentIndex = stops.findIndex((stop) => stop.id === stopId);

  if (currentIndex < 0) {
    return null;
  }

  const nextStops = [...stops];
  const [movedStop] = nextStops.splice(currentIndex, 1);

  if (!movedStop) {
    return null;
  }

  const safeInsertionIndex = Math.max(
    0,
    Math.min(insertionIndex, nextStops.length),
  );

  nextStops.splice(safeInsertionIndex, 0, movedStop);

  return nextStops;
}

function moveStopAfterAnchor(
  stops: AmazonAssistStopWithRole[],
  stopId: string,
  anchorStopId: string,
): AmazonAssistStopWithRole[] | null {
  if (stopId === anchorStopId) {
    return null;
  }

  const withoutMovedStop = stops.filter((stop) => stop.id !== stopId);

  if (withoutMovedStop.length === stops.length) {
    return null;
  }

  const anchorIndex = withoutMovedStop.findIndex(
    (stop) => stop.id === anchorStopId,
  );

  if (anchorIndex < 0) {
    return null;
  }

  const movedStop = stops.find((stop) => stop.id === stopId);

  if (!movedStop) {
    return null;
  }

  const nextStops = [...withoutMovedStop];
  nextStops.splice(anchorIndex + 1, 0, movedStop);

  return nextStops;
}

function findBestInsertionForStop(
  stops: AmazonAssistStopWithRole[],
  stopId: string,
  startPoint?: AmazonAssistPoint | null,
  endPoint?: AmazonAssistPoint | null,
): {
  orderedStops: AmazonAssistStopWithRole[];
  savingMeters: number;
  previousIndex: number;
  nextIndex: number;
} | null {
  const previousIndex = stops.findIndex((stop) => stop.id === stopId);

  if (previousIndex < 0) {
    return null;
  }

  const baselineDistance = calculateSequenceDistanceMeters(
    stops,
    startPoint,
    endPoint,
  );

  let bestStops: AmazonAssistStopWithRole[] | null = null;
  let bestDistance = baselineDistance;
  let bestIndex = previousIndex;

  for (
    let insertionIndex = 0;
    insertionIndex < stops.length;
    insertionIndex += 1
  ) {
    const candidateStops = moveStopToIndex(
      stops,
      stopId,
      insertionIndex,
    );

    if (!candidateStops) {
      continue;
    }

    const candidateIndex = candidateStops.findIndex(
      (stop) => stop.id === stopId,
    );

    if (candidateIndex === previousIndex) {
      continue;
    }

    const candidateDistance = calculateSequenceDistanceMeters(
      candidateStops,
      startPoint,
      endPoint,
    );

    if (candidateDistance < bestDistance) {
      bestDistance = candidateDistance;
      bestStops = candidateStops;
      bestIndex = candidateIndex;
    }
  }

  if (!bestStops) {
    return null;
  }

  return {
    orderedStops: bestStops,
    savingMeters: Math.max(
      0,
      Math.round(baselineDistance - bestDistance),
    ),
    previousIndex,
    nextIndex: bestIndex,
  };
}

function buildRevisitCandidate(
  stops: AmazonAssistStopWithRole[],
  anomaly: AmazonAssistAnomaly,
  startPoint?: AmazonAssistPoint | null,
  endPoint?: AmazonAssistPoint | null,
): {
  orderedStops: AmazonAssistStopWithRole[];
  correction: AmazonAssistAppliedCorrection;
} | null {
  const anchorStopId = anomaly.stopIds[0];
  const stopId = anomaly.stopIds[1];

  if (!anchorStopId || !stopId) {
    return null;
  }

  const previousIndex = stops.findIndex((stop) => stop.id === stopId);

  if (previousIndex < 0) {
    return null;
  }

  const candidateStops = moveStopAfterAnchor(
    stops,
    stopId,
    anchorStopId,
  );

  if (!candidateStops) {
    return null;
  }

  const nextIndex = candidateStops.findIndex(
    (stop) => stop.id === stopId,
  );

  if (nextIndex === previousIndex) {
    return null;
  }

  const previousDistance = calculateSequenceDistanceMeters(
    stops,
    startPoint,
    endPoint,
  );

  const nextDistance = calculateSequenceDistanceMeters(
    candidateStops,
    startPoint,
    endPoint,
  );

  const savingMeters = Math.round(previousDistance - nextDistance);

  if (savingMeters < MIN_REVISIT_SAVING_METERS) {
    return null;
  }

  return {
    orderedStops: candidateStops,
    correction: {
      type: anomaly.type,
      stopId,
      anchorStopId,
      previousIndex,
      nextIndex,
      savingMeters,
      description: anomaly.description,
    },
  };
}

function buildRouteJumpCandidate(
  stops: AmazonAssistStopWithRole[],
  anomaly: AmazonAssistAnomaly,
  startPoint?: AmazonAssistPoint | null,
  endPoint?: AmazonAssistPoint | null,
): {
  orderedStops: AmazonAssistStopWithRole[];
  correction: AmazonAssistAppliedCorrection;
} | null {
  const stopId = anomaly.stopIds[1];

  if (!stopId) {
    return null;
  }

  const bestInsertion = findBestInsertionForStop(
    stops,
    stopId,
    startPoint,
    endPoint,
  );

  if (
    !bestInsertion ||
    bestInsertion.savingMeters < MIN_ROUTE_JUMP_SAVING_METERS
  ) {
    return null;
  }

  return {
    orderedStops: bestInsertion.orderedStops,
    correction: {
      type: anomaly.type,
      stopId,
      anchorStopId: null,
      previousIndex: bestInsertion.previousIndex,
      nextIndex: bestInsertion.nextIndex,
      savingMeters: bestInsertion.savingMeters,
      description: anomaly.description,
    },
  };
}

function countChangedStops(
  originalStops: AmazonAssistStopWithRole[],
  correctedStops: AmazonAssistStopWithRole[],
): number {
  const originalIndexById = new Map(
    originalStops.map((stop, index) => [stop.id, index]),
  );

  return correctedStops.filter(
    (stop, index) => originalIndexById.get(stop.id) !== index,
  ).length;
}

/**
 * Amazon Assist V1
 *
 * Corregge soltanto anomalie per le quali lo spostamento produce
 * un risparmio geometrico misurabile.
 *
 * START e RETURN vengono separati prima delle correzioni e reinseriti
 * rispettivamente come primo e ultimo stop.
 */
export function optimizeAmazonAssistRoute(
  stops: AmazonAssistStopWithRole[],
  externalStartPoint?: AmazonAssistPoint | null,
  externalEndPoint?: AmazonAssistPoint | null,
): AmazonAssistResult {
  const originalSequence =
    sortAmazonStopsByOriginalSequence(stops) as AmazonAssistStopWithRole[];

  const fixedStartStop =
    originalSequence.find((stop) => stop.stop_role === "start") ?? null;

  const fixedReturnStop =
    originalSequence.find((stop) => stop.stop_role === "return") ?? null;

  const originalDeliveryStops = originalSequence.filter(
    (stop) =>
      stop.stop_role !== "start" &&
      stop.stop_role !== "return",
  );

  const startPoint = fixedStartStop
    ? {
        lat: fixedStartStop.lat,
        lng: fixedStartStop.lng,
      }
    : externalStartPoint ?? null;

  const endPoint = fixedReturnStop
    ? {
        lat: fixedReturnStop.lat,
        lng: fixedReturnStop.lng,
      }
    : externalEndPoint ?? null;

  const originalAnalysis = analyzeAmazonRoute(
  originalDeliveryStops,
  false,
);

  let correctedDeliveryStops = [...originalDeliveryStops];

  const corrections: AmazonAssistAppliedCorrection[] = [];
  const movedStopIds = new Set<string>();

  for (
    let correctionIndex = 0;
    correctionIndex < MAX_AUTOMATIC_CORRECTIONS;
    correctionIndex += 1
  ) {
    const currentAnalysis = analyzeAmazonRoute(
  correctedDeliveryStops,
  true,
);

    const candidates: {
      orderedStops: AmazonAssistStopWithRole[];
      correction: AmazonAssistAppliedCorrection;
    }[] = [];

    for (const anomaly of currentAnalysis.anomalies) {
      if (anomaly.severity < 55) {
        continue;
      }

      const candidateStopId =
        anomaly.type === "route_jump"
          ? anomaly.stopIds[1]
          : anomaly.stopIds[1];

      if (!candidateStopId || movedStopIds.has(candidateStopId)) {
        continue;
      }

      const candidate =
        anomaly.type === "route_jump"
          ? buildRouteJumpCandidate(
              correctedDeliveryStops,
              anomaly,
              startPoint,
              endPoint,
            )
          : buildRevisitCandidate(
              correctedDeliveryStops,
              anomaly,
              startPoint,
              endPoint,
            );

      if (candidate) {
        candidates.push(candidate);
      }
    }

    const bestCandidate = candidates.sort(
      (first, second) =>
        second.correction.savingMeters -
        first.correction.savingMeters,
    )[0];

    if (!bestCandidate) {
      break;
    }

    correctedDeliveryStops = bestCandidate.orderedStops;
    corrections.push(bestCandidate.correction);
    movedStopIds.add(bestCandidate.correction.stopId);
  }

  const orderedStops: AmazonAssistStopWithRole[] = [
    ...(fixedStartStop ? [fixedStartStop] : []),
    ...correctedDeliveryStops,
    ...(fixedReturnStop ? [fixedReturnStop] : []),
  ];

  const analysis = analyzeAmazonRoute(
  correctedDeliveryStops,
  true,
);

  const appliedSavingMeters = corrections.reduce(
    (total, correction) => total + correction.savingMeters,
    0,
  );

  return {
    orderedStops,
    originalAnalysis,
    analysis,
    corrections,
    changed: corrections.length > 0,
    changedStopCount: countChangedStops(
      originalDeliveryStops,
      correctedDeliveryStops,
    ),
    appliedSavingMeters,
    appliedSavingSeconds: Math.round(appliedSavingMeters / 8),
    method: "amazon_assist_v1_conservative_corrections",
  };
}
