"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type RouteProAnalyticsPanelProps = {
  completionRate: number;
  optimizedRoutes: number;
  trackedSessions: number;
  averageDuration: string;
  routesCompleted: number;
  stopsManaged: number;
  avgStopsPerRoute: number;
  bestDayStops: number;
};

const panelStyle: CSSProperties = {
  marginTop: ndwTokens.spacing["3xl"],
  borderRadius: ndwTokens.radius["2xl"],
  border: "1px solid rgba(147,197,253,0.28)",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
  overflow: "hidden",
};

const toggleStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: 20,
  border: 0,
  background: "transparent",
  color: "#ffffff",
  cursor: "pointer",
  textAlign: "left",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#93c5fd",
};

const summaryStyle: CSSProperties = {
  margin: "7px 0 0",
  fontSize: 14,
  lineHeight: 1.45,
  fontWeight: 700,
  color: "rgba(255,255,255,0.76)",
};

const toggleLabelStyle: CSSProperties = {
  flexShrink: 0,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 900,
};

const bodyStyle: CSSProperties = {
  padding: "0 20px 20px",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: ndwTokens.spacing.md,
};

const cardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#bfdbfe",
};

const valueStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const hintStyle: CSSProperties = {
  margin: "7px 0 0",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 700,
  color: "rgba(255,255,255,0.68)",
};

export function RouteProAnalyticsPanel({
  completionRate,
  optimizedRoutes,
  trackedSessions,
  averageDuration,
  routesCompleted,
  stopsManaged,
  avgStopsPerRoute,
  bestDayStops,
}: RouteProAnalyticsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section style={panelStyle}>
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-expanded={isOpen}
        style={toggleStyle}
      >
        <div>
          <p style={titleStyle}>Performance Dashboard</p>

          <p style={summaryStyle}>
            {routesCompleted} rotte completate · {stopsManaged} stop gestiti
          </p>
        </div>

        <span style={toggleLabelStyle}>
          {isOpen ? "Nascondi statistiche" : "Mostra statistiche"}
        </span>
      </button>

      {isOpen ? (
        <div style={bodyStyle}>
          <div style={gridStyle}>
            <AnalyticsCard
              label="Success Rate"
              value={`${completionRate}%`}
              hint="Rotte completate sul totale preparato."
            />

            <AnalyticsCard
              label="Ready to Drive"
              value={String(optimizedRoutes)}
              hint="Rotte ottimizzate e pronte."
            />

            <AnalyticsCard
              label="Driving Sessions"
              value={String(trackedSessions)}
              hint="Sessioni con attività di guida registrata."
            />

            <AnalyticsCard
              label="Average Route Time"
              value={averageDuration}
              hint="Durata media reale delle rotte completate."
            />

            <AnalyticsCard
              label="Completed Routes"
              value={String(routesCompleted)}
              hint="Giornate di consegna completate."
            />

            <AnalyticsCard
              label="Delivered Stops"
              value={String(stopsManaged)}
              hint="Stop complessivamente gestiti."
            />

            <AnalyticsCard
              label="Average Stops"
              value={String(avgStopsPerRoute)}
              hint="Numero medio di stop per rotta."
            />

            <AnalyticsCard
              label="Best Route"
              value={String(bestDayStops)}
              hint="Numero massimo di stop completati."
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AnalyticsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article style={cardStyle}>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value}</p>
      <p style={hintStyle}>{hint}</p>
    </article>
  );
}