import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addBulkRouteProStops,
  addCsvRouteProStops,
  addManualRouteProStop,
  deleteRouteProRoute,
  deleteRouteProStop,
  geocodeRouteProStops,
  optimizeRouteProRoute,
  updateRouteProStopAddress,
} from "@/modules/routepro/server/routepro.actions";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";
import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import { RouteProWorkflowHeader } from "@/modules/routepro/v2/ui/RouteProWorkflowHeader";
import { calculateRouteProMetrics } from "@/modules/routepro/server/routepro.metrics";

type Props = {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{
    error?: string;
    geocoded?: string;
    updated?: string;
    deleted?: string;
    optimized?: string;
    csvImported?: string;
    screenshotImported?: string;
  }>;
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 18,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 12,
};

const pageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 16,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#334155",
  fontWeight: 600,
};

const compactCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 20,
  border: "1px solid #cbd5e1",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const kpiCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 22,
  border: "1px solid rgba(147,197,253,0.28)",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  boxShadow: "0 16px 34px rgba(15,23,42,0.18)",
};

const kpiLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#93c5fd",
};

const kpiValueStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: "#ffffff",
};

const kpiHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 700,
  color: "rgba(255,255,255,0.78)",
};

const analyticsPanelStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 24,
  marginBottom: 24,
  padding: 24,
  border: "1px solid rgba(147,197,253,0.28)",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.88) 100%)",
  boxShadow: "0 16px 34px rgba(15,23,42,0.18)",
};

const analyticsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const analyticsCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const analyticsLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const analyticsValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 26,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const analyticsHintStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 700,
  color: "rgba(255,255,255,0.68)",
};

const heroCardStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 20,
  marginBottom: 24,
  padding: 24,
  border: "1px solid #1e40af",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.92) 100%)",
};

const heroTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(36px, 5vw, 56px)",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.05em",
  color: "#ffffff",
};

const heroSubtitleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 16,
  lineHeight: 1.6,
  fontWeight: 600,
  color: "rgba(255,255,255,0.85)",
};

const heroStatsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18,
};

const heroBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 800,
};

const premiumPanelStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 24,
  marginBottom: 24,
  padding: 24,
  border: "1px solid #1e40af",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
};

const premiumPanelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#93c5fd",
};

const premiumGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const premiumMiniCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const premiumMiniLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 950,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const premiumMiniValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 900,
  color: "#ffffff",
};

const premiumMiniHintStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 700,
  color: "rgba(255,255,255,0.68)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 15,
  fontWeight: 950,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#f97316",
};

const actionCardHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 950,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: "#0f172a",
};

const actionCardIconStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffedd5",
  color: "#f97316",
  fontSize: 20,
  fontWeight: 950,
  marginBottom: 12,
};

const darkActionCardStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 14px 34px rgba(15,23,42,0.16)",
};

const darkActionIconStyle: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 15,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,122,0,0.16)",
  color: "#ff7a00",
  fontSize: 22,
  fontWeight: 950,
  marginBottom: 14,
};

const darkActionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#ffffff",
};

const darkActionTextStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 14,
  lineHeight: 1.55,
  color: "#cbd5e1",
  fontWeight: 700,
};

const darkActionLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 16,
  fontSize: 13,
  fontWeight: 900,
  color: "#dbeafe",
};

const darkActionInputStyle: React.CSSProperties = {
  ...ui.form.input,
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid rgba(255,255,255,0.2)",
};

const darkActionTextareaStyle: React.CSSProperties = {
  ...ui.form.input,
  resize: "vertical",
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid rgba(255,255,255,0.2)",
};

const workflowStatusBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.16)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginTop: 12,
};

const stopBadgeLabelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 2,
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.72,
};

const dangerZoneStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 32,
  padding: 22,
  border: "1px solid #dc2626",
  background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
  boxShadow: "0 18px 36px rgba(127,29,29,0.22)",
};

const dangerTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#fecaca",
  fontWeight: 700,
};

const stopListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 18,
};

const stopRowStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 18,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const stopCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const stopNumberGroupStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
};

const amazonStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.02em",
};

const optimizedStopBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.02em",
};

const stopAddressStyle: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 20,
  lineHeight: 1.35,
  fontWeight: 900,
  color: "#0f172a",
};

const stopMetaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const stopMetaItemStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

const stopEditPanelStyle: React.CSSProperties = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: "1px solid #e2e8f0",
};

const stopActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 12,
};

const reviewSummaryStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 28,
  padding: 24,
  border: "1px solid rgba(147,197,253,0.28)",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
};

const reviewGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const reviewMiniCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const reviewMiniLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const reviewMiniValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const problemStopCardStyle: React.CSSProperties = {
  ...ui.card.base,
  padding: 18,
  border: "1px solid rgba(249,115,22,0.55)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,247,237,1) 100%)",
  boxShadow: "0 14px 34px rgba(249,115,22,0.14)",
};

const compactStopRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "90px 1fr auto",
  gap: 12,
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
};

const compactStopNumberStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#f97316",
};

const compactStopAddressStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 850,
  color: "#0f172a",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const okCollapseStyle: React.CSSProperties = {
  ...ui.card.base,
  marginTop: 18,
  padding: 18,
  border: "1px solid #1e40af",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.88) 100%)",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  background: "#f1f5f9",
  color: "#334155",
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 600,
};

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf5",
  color: "#047857",
  fontWeight: 600,
};

function getErrorMessage(error?: string): string | null {
  if (error === "missing-address") return "Inserisci un indirizzo prima di aggiungere lo stop.";
  if (error === "add-stop-failed") return "Non siamo riusciti ad aggiungere lo stop. Riprova.";
  if (error === "geocode-failed") return "Non siamo riusciti a geocodificare gli stop. Riprova.";
  if (error === "update-stop-failed") return "Non siamo riusciti ad aggiornare lo stop. Riprova.";
  if (error === "delete-stop-failed") return "Non siamo riusciti a eliminare lo stop. Riprova.";
  if (error === "optimize-failed") return "Non siamo riusciti a ottimizzare la rotta. Riprova.";
  if (error === "optimize-needs-review") return "Prima di ottimizzare devi correggere tutti gli stop da rivedere.";
  if (error === "optimize-not-enough-stops") return "Servono almeno 2 stop validi per ottimizzare la rotta.";
  if (error === "csv-missing") return "Carica un file CSV prima di importare.";
  if (error === "csv-invalid") return "Il CSV non è valido. Usa una riga header e almeno un indirizzo.";
  if (error === "csv-missing-address-column") return "Il CSV deve contenere una colonna chiamata address.";
  if (error === "csv-failed") return "Non siamo riusciti a importare il CSV. Riprova.";
  if (error === "ocr-import-empty") return "Non ci sono righe OCR da importare.";
  if (error === "ocr-import-failed") return "Non siamo riusciti a importare gli stop dallo screenshot.";
  if (error === "delete-route-failed") return "Non siamo riusciti a cancellare la rotta. Riprova.";

  return null;
}

function getTimeMinutes(value?: string | null): number | null {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getAvailableShiftMinutes(
  shiftStartTime?: string | null,
  shiftEndTime?: string | null,
  breakMinutes?: number | null,
): number | null {
  const start = getTimeMinutes(shiftStartTime);
  const end = getTimeMinutes(shiftEndTime);

  if (start === null || end === null) return null;

  const rawMinutes = end > start ? end - start : end + 1440 - start;
  const pause = breakMinutes ?? 0;

  return Math.max(rawMinutes - pause, 0);
}

function getRequiredStopsPerHour(stops: number, availableMinutes: number | null): number | null {
  if (availableMinutes === null || availableMinutes <= 0) return null;

  return Math.round((stops / (availableMinutes / 60)) * 10) / 10;
}

function getMinutesPerStop(requiredStopsPerHour: number | null): number | null {
  if (requiredStopsPerHour === null || requiredStopsPerHour <= 0) return null;

  return Math.round((60 / requiredStopsPerHour) * 10) / 10;
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  if (status === "completed") {
    return {
      ...badgeStyle,
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "needs_review") {
    return {
      ...badgeStyle,
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "valid") {
    return {
      ...badgeStyle,
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  if (status === "skipped") {
    return {
      ...badgeStyle,
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return badgeStyle;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }

  return `${hours}h ${mins}m`;
}

export default async function RouteProRoutePage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const resolvedSearchParams = await searchParams;

  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const geocoded = resolvedSearchParams?.geocoded;
  const updated = resolvedSearchParams?.updated;
  const deleted = resolvedSearchParams?.deleted;
  const optimized = resolvedSearchParams?.optimized;
  const csvImported = resolvedSearchParams?.csvImported;
  const screenshotImported = resolvedSearchParams?.screenshotImported;

  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const completedStops = route.stops.filter(
    (stop) => stop.status === "completed",
  );

  const skippedStops = route.stops.filter(
    (stop) => stop.status === "skipped",
  );

  const durationMinutes =
    route.started_at && route.completed_at
      ? Math.max(
          1,
          Math.round(
            (new Date(route.completed_at).getTime() -
              new Date(route.started_at).getTime()) /
              60000,
          ),
        )
      : null;

  const averageStopsPerHour =
    durationMinutes && durationMinutes > 0
      ? Number(
          (
            ((completedStops.length + skippedStops.length) /
              durationMinutes) *
            60
          ).toFixed(1),
        )
      : null;

  const totalStops = route.stops.length;
  const validStops = route.stops.filter((stop) => stop.status === "valid").length;
  const rawStops = route.stops.filter((stop) => stop.status === "raw").length;
  const needsReviewCount = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;
  const problemStops = route.stops.filter(
  (stop) => stop.status === "needs_review" || stop.status === "raw",
);

const readyStops = route.stops.filter(
  (stop) =>
    stop.status !== "needs_review" &&
    stop.status !== "raw",
);

const readyStopsCount = readyStops.length;

  const availableShiftMinutes = getAvailableShiftMinutes(
    route.shift_start_time,
    route.shift_end_time,
    route.break_minutes,
  );

  const requiredStopsPerHour = getRequiredStopsPerHour(
    validStops,
    availableShiftMinutes,
  );

  const minutesPerStop = getMinutesPerStop(requiredStopsPerHour);

  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Import your stops. Review your route. Drive smarter." />

<RouteProWorkflowHeader
  steps={[
    { label: "Import", status: totalStops > 0 ? "completed" : "current" },
    { label: "Extract", status: totalStops > 0 ? "completed" : "pending" },
    {
      label: "Review",
      status: needsReviewCount > 0 ? "current" : totalStops > 0 ? "completed" : "pending",
    },
    {
      label: "Verify",
      status: rawStops > 0 ? "current" : validStops > 0 ? "completed" : "pending",
    },
    {
      label: "Optimize",
      status: route.is_optimized ? "completed" : validStops >= 2 ? "current" : "pending",
    },
    {
      label: "Drive",
      status: route.is_optimized ? "current" : "pending",
    },
    {
      label: "Summary",
      status: route.status === "completed" ? "completed" : "pending",
    },
  ]}
/>

      <div style={heroCardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#93c5fd",
          }}
        >
          RoutePro Command Center
        </p>

        <h1 style={heroTitleStyle}>{route.name}</h1>

        <p style={heroSubtitleStyle}>
          Review your route. Verify addresses. Optimize stops. Drive smarter.
        </p>

        <div style={heroStatsStyle}>
          <div style={heroBadgeStyle}>{totalStops} Stops</div>
          <div style={heroBadgeStyle}>Status: {route.status}</div>
          <div style={heroBadgeStyle}>Date: {route.route_date}</div>
          <div style={heroBadgeStyle}>
  Profile: {route.route_profile ?? "generic"}
</div>

{route.shift_start_time || route.shift_end_time ? (
  <div style={heroBadgeStyle}>
    Shift: {route.shift_start_time ?? "—"} - {route.shift_end_time ?? "—"}
  </div>
) : null}

<div style={heroBadgeStyle}>
  Break: {route.break_minutes ?? 0} min
</div>

          {route.is_optimized ? <div style={heroBadgeStyle}>Optimized</div> : null}
        </div>
      </div>

      <div style={actionsStyle}>
        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Rotte
        </Link>

        <Link href={`/app/routepro/routes/${route.id}/review`} style={routeProUi.primaryButton}>
          Apri Workflow V2
        </Link>

        <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.secondaryButton}>
          Avvia percorso classico
        </Link>

        <Link href="/app/routepro/settings" style={routeProUi.secondaryButton}>
          API
        </Link>
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {geocoded === "1" ? <div style={successStyle}>Geocoding completato. Controlla eventuali stop da rivedere.</div> : null}
      {updated === "1" ? (
  <div style={successStyle}>
    Stop aggiornato. Ora verifica gli indirizzi per aggiornare le coordinate.
  </div>
) : null}
      {deleted === "1" ? <div style={successStyle}>Stop eliminato correttamente.</div> : null}
      {optimized === "1" ? <div style={successStyle}>Rotta ottimizzata. L’ordine degli stop è stato aggiornato.</div> : null}
      {csvImported === "1" ? <div style={successStyle}>CSV importato correttamente.</div> : null}
      {screenshotImported === "1" ? (
        <div style={successStyle}>
          Stop importati dallo screenshot. Ora puoi controllarli e geocodificarli.
        </div>
      ) : null}

      {needsReviewCount > 0 ? (
        <div style={errorStyle}>
          {needsReviewCount} stop da rivedere prima di ottimizzare o partire.
        </div>
      ) : null}

      <div style={premiumPanelStyle}>
        <p style={premiumPanelTitleStyle}>Route Profile</p>

        <div style={premiumGridStyle}>
          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Start</p>
            <p style={premiumMiniValueStyle}>{route.start_address ?? "Not set"}</p>
            <p style={premiumMiniHintStyle}>Punto di partenza operativo.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Return</p>
            <p style={premiumMiniValueStyle}>{route.return_address ?? "Not set"}</p>
            <p style={premiumMiniHintStyle}>Punto di rientro finale.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Shift</p>
            <p style={premiumMiniValueStyle}>
              {route.shift_start_time ?? "—"} → {route.shift_end_time ?? "—"}
            </p>
            <p style={premiumMiniHintStyle}>Finestra operativa della rotta.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Break</p>
            <p style={premiumMiniValueStyle}>{route.break_minutes ?? 0} min</p>
            <p style={premiumMiniHintStyle}>Pausa considerata nel ritmo.</p>
          </article>
        </div>
      </div>

      <div style={premiumPanelStyle}>
        <p style={premiumPanelTitleStyle}>Pace Intelligence</p>

        <div style={premiumGridStyle}>
          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Tempo utile</p>
            <p style={premiumMiniValueStyle}>
              {availableShiftMinutes !== null
                ? `${Math.floor(availableShiftMinutes / 60)}h ${availableShiftMinutes % 60}m`
                : "Non impostato"}
            </p>
            <p style={premiumMiniHintStyle}>Turno al netto della pausa.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Pace richiesto</p>
            <p style={premiumMiniValueStyle}>
              {requiredStopsPerHour !== null
                ? `${requiredStopsPerHour} stop/h`
                : "Da impostare"}
            </p>
            <p style={premiumMiniHintStyle}>Media necessaria per completare.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Target medio</p>
            <p style={premiumMiniValueStyle}>
              {minutesPerStop !== null ? `1 ogni ${minutesPerStop} min` : "—"}
            </p>
            <p style={premiumMiniHintStyle}>Tempo medio disponibile per stop.</p>
          </article>

          <article style={premiumMiniCardStyle}>
            <p style={premiumMiniLabelStyle}>Livello</p>
            <p style={premiumMiniValueStyle}>
              {requiredStopsPerHour === null
                ? "Incompleto"
                : requiredStopsPerHour <= 18
                  ? "Comodo"
                  : requiredStopsPerHour <= 24
                    ? "Impegnativo"
                    : "Critico"}
            </p>
            <p style={premiumMiniHintStyle}>Valutazione operativa del turno.</p>
          </article>
        </div>
      </div>

      <div style={pageGridStyle}>
        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Stop totali</p>
          <h2 style={kpiValueStyle}>{totalStops}</h2>
          <p style={kpiHintStyle}>Stop importati nella rotta.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Da geocodificare</p>
          <h2 style={kpiValueStyle}>{rawStops}</h2>
          <p style={kpiHintStyle}>Stop ancora da trasformare in coordinate.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Validi</p>
          <h2 style={kpiValueStyle}>{validStops}</h2>
          <p style={kpiHintStyle}>Stop pronti per ottimizzazione e guida.</p>
        </article>

        <article style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Da rivedere</p>
          <h2 style={kpiValueStyle}>{needsReviewCount}</h2>
          <p style={kpiHintStyle}>Stop che richiedono controllo manuale.</p>
        </article>
      </div>

      <section style={analyticsPanelStyle}>
        <p style={premiumPanelTitleStyle}>Route Analytics</p>

        <div style={analyticsGridStyle}>
          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Durata reale</p>
            <p style={analyticsValueStyle}>{formatDuration(durationMinutes)}</p>
            <p style={analyticsHintStyle}>Calcolata da start a completamento rotta.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Completati</p>
            <p style={analyticsValueStyle}>{completedStops.length}</p>
            <p style={analyticsHintStyle}>Stop chiusi come completati.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Saltati</p>
            <p style={analyticsValueStyle}>{skippedStops.length}</p>
            <p style={analyticsHintStyle}>Stop marcati come skip.</p>
          </article>

          <article style={analyticsCardStyle}>
            <p style={analyticsLabelStyle}>Velocità media</p>
            <p style={analyticsValueStyle}>
              {averageStopsPerHour !== null ? `${averageStopsPerHour}/h` : "—"}
            </p>
            <p style={analyticsHintStyle}>Stop gestiti per ora reale.</p>
          </article>
        </div>
      </section>

      <section style={premiumPanelStyle}>
        <p style={premiumPanelTitleStyle}>Route Workflow</p>

        <div style={premiumGridStyle}>
          <div style={darkActionCardStyle}>
            <div style={darkActionIconStyle}>✓</div>
            <h3 style={darkActionTitleStyle}>Verify</h3>
            <p style={darkActionTextStyle}>
              Trasforma gli indirizzi in coordinate e segnala gli stop da rivedere.
            </p>

            <span style={workflowStatusBadgeStyle}>
              {rawStops > 0 ? "Da verificare" : "Verificato"}
            </span>

            <form action={geocodeRouteProStops} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <RouteProSubmitButton
                idleLabel="Verifica indirizzi"
                pendingLabel="Riconoscimento in corso..."
              />
            </form>
          </div>

          <div style={darkActionCardStyle}>
            <div style={darkActionIconStyle}>⚡</div>
            <h3 style={darkActionTitleStyle}>Optimize</h3>
            <p style={darkActionTextStyle}>
              Riordina gli stop validi mantenendo sempre il numero originale.
            </p>

            <span style={workflowStatusBadgeStyle}>
              {route.is_optimized ? "Ottimizzata" : "Pronta"}
            </span>

            <form action={optimizeRouteProRoute} style={{ marginTop: 16 }}>
              <input type="hidden" name="route_id" value={route.id} />

              <RouteProSubmitButton
                idleLabel="Ottimizza"
                pendingLabel="Ottimizzazione in corso..."
              />
            </form>

            {route.is_optimized ? (
              <p style={darkActionTextStyle}>
                Ultima ottimizzazione: {route.optimized_at ?? "completata"}
              </p>
            ) : null}
          </div>

          <div style={darkActionCardStyle}>
            <div style={darkActionIconStyle}>▶</div>
            <h3 style={darkActionTitleStyle}>Drive</h3>
            <p style={darkActionTextStyle}>
              Apri la modalità driver con Maps/Waze, complete e skip.
            </p>

            <span style={workflowStatusBadgeStyle}>
              {route.is_optimized ? "Disponibile" : "Ottimizza prima"}
            </span>

            <div style={actionsStyle}>
              <Link href={`/app/routepro/${route.id}/execute`} style={routeProUi.primaryButton}>
                Avvia percorso
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 28 }}>
  <h2 style={sectionTitleStyle}>Driver Review</h2>

  <section style={reviewSummaryStyle}>
    <p style={premiumPanelTitleStyle}>Stop Quality Control</p>

    <div style={reviewGridStyle}>
      <article style={reviewMiniCardStyle}>
        <p style={reviewMiniLabelStyle}>Totali</p>
        <p style={reviewMiniValueStyle}>{totalStops}</p>
      </article>

      <article style={reviewMiniCardStyle}>
        <p style={reviewMiniLabelStyle}>Pronti</p>
        <p style={reviewMiniValueStyle}>{readyStopsCount}</p>
      </article>

      <article style={reviewMiniCardStyle}>
        <p style={reviewMiniLabelStyle}>Da geocodificare</p>
        <p style={reviewMiniValueStyle}>{rawStops}</p>
      </article>

      <article style={reviewMiniCardStyle}>
        <p style={reviewMiniLabelStyle}>Da correggere</p>
        <p style={reviewMiniValueStyle}>{needsReviewCount}</p>
      </article>
    </div>

    <p style={{ ...kpiHintStyle, marginTop: 16 }}>
      {problemStops.length > 0
        ? `${problemStops.length} stop richiedono attenzione prima di ottimizzare.`
        : "Tutti gli stop sono pronti per ottimizzazione e guida."}
    </p>
  </section>

  {route.stops.length === 0 ? (
    <div style={{ ...ui.card.base, marginTop: 18 }}>
      <p style={mutedTextStyle}>
        Nessuno stop inserito. Carica screenshot, lista o CSV per iniziare.
      </p>
    </div>
  ) : (
    <>
      {problemStops.length > 0 ? (
        <div style={stopListStyle}>
          {problemStops.map((stop) => (
            <article key={stop.id} style={problemStopCardStyle}>
              <div style={stopCardHeaderStyle}>
                <div style={stopNumberGroupStyle}>
                  <span style={amazonStopBadgeStyle}>
                    STOP #{stop.original_position}
                    <span style={stopBadgeLabelStyle}>Originale</span>
                  </span>

                  <span style={optimizedStopBadgeStyle}>
                    OPT #{stop.position}
                    <span style={stopBadgeLabelStyle}>Ottimizzato</span>
                  </span>
                </div>

                <span style={getStatusBadgeStyle(stop.status)}>
                  {stop.status}
                </span>
              </div>

              <div style={stopAddressStyle}>{stop.address}</div>

              <div style={stopMetaGridStyle}>
                <div style={stopMetaItemStyle}>Fonte: {stop.source}</div>

                {stop.lat && stop.lng ? (
                  <div style={stopMetaItemStyle}>
                    Coordinate: {stop.lat}, {stop.lng}
                  </div>
                ) : (
                  <div style={stopMetaItemStyle}>
                    Coordinate: non disponibili
                  </div>
                )}
              </div>

              <div style={stopEditPanelStyle}>
                <form action={updateRouteProStopAddress} style={formStyle}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={stop.id} />

                  <label style={ui.form.label}>
                    Correggi indirizzo
                    <input
                      name="address"
                      type="text"
                      defaultValue={stop.address}
                      style={ui.form.input}
                    />
                  </label>

                  <div style={stopActionsStyle}>
                    <RouteProSubmitButton
                      idleLabel="Aggiorna"
                      pendingLabel="Aggiornamento..."
                      variant="secondary"
                    />
                  </div>
                </form>

                <form action={deleteRouteProStop} style={{ marginTop: 12 }}>
                  <input type="hidden" name="route_id" value={route.id} />
                  <input type="hidden" name="stop_id" value={stop.id} />

                  <RouteProSubmitButton
                    idleLabel="Elimina"
                    pendingLabel="Eliminazione..."
                    variant="danger"
                  />
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={successStyle}>
          Tutti gli stop sono pronti. Puoi geocodificare, ottimizzare o partire.
        </div>
      )}

      <details style={okCollapseStyle}>
        <summary
          style={{
            cursor: "pointer",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 950,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Stop pronti / completati ({readyStops.length})
        </summary>

        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
          {readyStops.map((stop) => (
            <div key={stop.id} style={compactStopRowStyle}>
              <span style={compactStopNumberStyle}>
                #{stop.original_position} → #{stop.position}
              </span>

              <span style={compactStopAddressStyle}>
                {stop.address}
              </span>

              <span style={getStatusBadgeStyle(stop.status)}>
                {stop.status}
              </span>
            </div>
          ))}
        </div>
      </details>
    </>
  )}
</div>

      <div style={dangerZoneStyle}>
        <h2 style={{ ...ui.page.sectionTitle, color: "#ffffff" }}>Zona pericolosa</h2>
        <p style={dangerTextStyle}>
          Cancella definitivamente questa rotta e tutti gli stop collegati.
        </p>

        <form action={deleteRouteProRoute} style={{ marginTop: 16 }}>
          <input type="hidden" name="route_id" value={route.id} />

          <RouteProSubmitButton
  idleLabel="Cancella rotta"
  pendingLabel="Cancellazione..."
  variant="danger"
/>
        </form>
      </div>
    </section>
  );
}