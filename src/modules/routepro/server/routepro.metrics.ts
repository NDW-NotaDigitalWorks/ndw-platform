export type RouteProMetricStop = {
  id: string;
  status: string;
  completed_at: string | null;
  skipped_at: string | null;
};

export type RouteProMetricRoute = {
  status?: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  stops: RouteProMetricStop[];
};

export type RouteProPaceStatus =
  | "waiting"
  | "ahead"
  | "on_time"
  | "slightly_late"
  | "late";

export type RouteProMetrics = {
  totalStops: number;
  completedStops: number;
  skippedStops: number;
  doneStops: number;
  remainingStops: number;
  operatingMinutes: number | null;
  averageMinutesPerStop: number | null;
  realStopsPerHour: number | null;
  requiredStopsPerHour: number | null;
  etaAt: Date | null;
  deviationMinutes: number | null;
  paceStatus: RouteProPaceStatus;
  paceLabel: string;
  score: string | null;
  hasEnoughData: boolean;
};

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000);
}

function roundNumber(value: number, decimals = 1): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function getLatestStopEventAt(stops: RouteProMetricStop[]): Date | null {
  const dates = stops
    .map((stop) => toDate(stop.completed_at) ?? toDate(stop.skipped_at))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ?? null;
}

function getFirstStopEventAt(stops: RouteProMetricStop[]): Date | null {
  const dates = stops
    .map((stop) => toDate(stop.completed_at) ?? toDate(stop.skipped_at))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime());

  return dates[0] ?? null;
}

function getShiftEndDate(route: RouteProMetricRoute, fallbackDate: Date): Date | null {
  if (!route.shift_end_time) return null;

  const [hours, minutes] = route.shift_end_time.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  const date = new Date(fallbackDate);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function getPaceStatus(params: {
  hasEnoughData: boolean;
  deviationMinutes: number | null;
}): RouteProPaceStatus {
  if (!params.hasEnoughData || params.deviationMinutes === null) {
    return "waiting";
  }

  if (params.deviationMinutes <= -20) return "ahead";
  if (params.deviationMinutes <= 10) return "on_time";
  if (params.deviationMinutes <= 25) return "slightly_late";
  return "late";
}

function getPaceLabel(status: RouteProPaceStatus): string {
  if (status === "ahead") return "In anticipo";
  if (status === "on_time") return "Nei tempi";
  if (status === "slightly_late") return "Leggermente in ritardo";
  if (status === "late") return "In ritardo";
  return "In attesa dati";
}

function getScore(params: {
  hasEnoughData: boolean;
  paceStatus: RouteProPaceStatus;
  completedStops: number;
  skippedStops: number;
}): string | null {
  if (!params.hasEnoughData) return null;

  const skippedRatio =
    params.completedStops + params.skippedStops > 0
      ? params.skippedStops / (params.completedStops + params.skippedStops)
      : 0;

  if (params.paceStatus === "ahead" && skippedRatio <= 0.02) return "A+";
  if (params.paceStatus === "on_time" && skippedRatio <= 0.05) return "A";
  if (params.paceStatus === "slightly_late") return "B";
  return "C";
}

export function calculateRouteProMetrics(route: RouteProMetricRoute): RouteProMetrics {
  const totalStops = route.stops.length;
  const completedStops = route.stops.filter(
    (stop) => stop.status === "completed",
  ).length;
  const skippedStops = route.stops.filter((stop) => stop.status === "skipped").length;
  const doneStops = completedStops + skippedStops;
  const remainingStops = Math.max(0, totalStops - doneStops);
  const hasEnoughData = doneStops >= 3;

  const firstEventAt =
    getFirstStopEventAt(route.stops) ?? toDate(route.started_at);
  const isCompletedRoute = route.status === "completed";

const latestEventAt = isCompletedRoute
  ? toDate(route.completed_at) ?? getLatestStopEventAt(route.stops)
  : getLatestStopEventAt(route.stops) ??
    toDate(route.completed_at) ??
    toDate(route.last_activity_at);

  const operatingMinutes =
    firstEventAt && latestEventAt
      ? getMinutesBetween(firstEventAt, latestEventAt)
      : null;

  const averageMinutesPerStop =
    hasEnoughData && operatingMinutes !== null && doneStops > 0
      ? roundNumber(operatingMinutes / doneStops, 1)
      : null;

  const realStopsPerHour =
    hasEnoughData && operatingMinutes !== null && operatingMinutes > 0
      ? roundNumber(doneStops / (operatingMinutes / 60), 1)
      : null;

  const etaAt = isCompletedRoute
  ? latestEventAt
  : averageMinutesPerStop !== null && remainingStops > 0
    ? new Date(
        (latestEventAt ?? new Date()).getTime() +
          averageMinutesPerStop * remainingStops * 60000,
      )
    : null;

  const shiftEndAt = getShiftEndDate(route, latestEventAt ?? new Date());

  const requiredStopsPerHour =
  isCompletedRoute || remainingStops === 0
    ? null
    : shiftEndAt && latestEventAt
      ? roundNumber(
          remainingStops /
            Math.max(0.01, getMinutesBetween(latestEventAt, shiftEndAt) / 60),
          1,
        )
      : null;

  const deviationMinutes =
    etaAt && shiftEndAt && hasEnoughData
      ? roundNumber(getMinutesBetween(shiftEndAt, etaAt), 0)
      : null;

  const paceStatus = getPaceStatus({
    hasEnoughData,
    deviationMinutes,
  });

  const score = getScore({
    hasEnoughData,
    paceStatus,
    completedStops,
    skippedStops,
  });

  return {
    totalStops,
    completedStops,
    skippedStops,
    doneStops,
    remainingStops,
    operatingMinutes:
      hasEnoughData && operatingMinutes !== null
        ? roundNumber(operatingMinutes, 1)
        : null,
    averageMinutesPerStop,
    realStopsPerHour,
    requiredStopsPerHour,
    etaAt,
    deviationMinutes,
    paceStatus,
    paceLabel: getPaceLabel(paceStatus),
    score,
    hasEnoughData,
  };
}