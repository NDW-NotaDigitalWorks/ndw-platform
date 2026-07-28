import type { CSSProperties } from "react";
import type { RouteProAmazonAssistDashboardModel } from "@/modules/routepro/server/routepro.amazon-assist.presenter";

type Props = {
  dashboard: RouteProAmazonAssistDashboardModel;
};

const shellStyle: CSSProperties = {
  marginTop: 24,
  padding: 20,
  borderRadius: 26,
  color: "#ffffff",
  background:
    "linear-gradient(145deg, #07111f 0%, #0f172a 48%, #172554 100%)",
  border: "1px solid rgba(96,165,250,0.3)",
  boxShadow: "0 24px 56px rgba(15,23,42,0.22)",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 27,
  lineHeight: 1.12,
  fontWeight: 950,
};

const bodyStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.6,
  fontWeight: 700,
};

const heroGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(150px, 210px) minmax(0, 1fr)",
  gap: 18,
  alignItems: "stretch",
  marginTop: 20,
};

const scoreCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: 190,
  padding: 18,
  borderRadius: 22,
  background:
    "linear-gradient(155deg, rgba(37,99,235,0.38), rgba(15,23,42,0.7))",
  border: "1px solid rgba(147,197,253,0.34)",
};

const scoreValueRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 5,
  marginTop: 10,
};

const scoreValueStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 56,
  lineHeight: 0.95,
  fontWeight: 950,
};

const scoreTotalStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 15,
  fontWeight: 900,
};

const improvementBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignSelf: "flex-start",
  marginTop: 14,
  padding: "7px 10px",
  borderRadius: 999,
  color: "#bbf7d0",
  background: "rgba(22,163,74,0.2)",
  border: "1px solid rgba(74,222,128,0.3)",
  fontSize: 12,
  fontWeight: 950,
};

const narrativeCardStyle: CSSProperties = {
  minWidth: 0,
  padding: 20,
  borderRadius: 22,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.2)",
};

const qualityStyle: CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 21,
  lineHeight: 1.2,
  fontWeight: 950,
};

const starsStyle: CSSProperties = {
  marginTop: 10,
  color: "#fde68a",
  fontSize: 19,
  letterSpacing: "0.08em",
};

const progressTrackStyle: CSSProperties = {
  height: 9,
  marginTop: 17,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(148,163,184,0.2)",
};

const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 11,
  marginTop: 18,
};

const metricCardStyle: CSSProperties = {
  minWidth: 0,
  padding: 15,
  borderRadius: 18,
  background: "rgba(255,255,255,0.065)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const metricLabelStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.25,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const metricValueStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 27,
  lineHeight: 1,
  fontWeight: 950,
  overflowWrap: "anywhere",
};

const metricHelperStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 750,
};

const sectionStyle: CSSProperties = {
  marginTop: 18,
  padding: 17,
  borderRadius: 21,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 950,
};

const timelineStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 9,
  marginTop: 14,
};

const timelineCardStyle: CSSProperties = {
  minWidth: 0,
  padding: 13,
  borderRadius: 16,
  textAlign: "center",
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const timelineLabelStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const timelineValueStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#ffffff",
  fontSize: 23,
  lineHeight: 1,
  fontWeight: 950,
  overflowWrap: "anywhere",
};

const anomalyGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
  marginTop: 14,
};

const anomalyCardStyle: CSSProperties = {
  padding: 13,
  borderRadius: 16,
  background: "rgba(15,23,42,0.5)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const anomalyValueStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const tipsListStyle: CSSProperties = {
  display: "grid",
  gap: 9,
  margin: "13px 0 0",
  padding: 0,
  listStyle: "none",
};

const tipStyle: CSSProperties = {
  padding: "11px 12px",
  borderRadius: 15,
  color: "#e2e8f0",
  background: "rgba(15,23,42,0.48)",
  border: "1px solid rgba(148,163,184,0.16)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 750,
};

const correctionListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  margin: "14px 0 0",
  padding: 0,
  listStyle: "none",
};

const correctionCardStyle: CSSProperties = {
  padding: 13,
  borderRadius: 16,
  background: "rgba(15,23,42,0.54)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const correctionHeaderStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const correctionTypeStyle: CSSProperties = {
  color: "#f8fafc",
  fontSize: 13,
  lineHeight: 1.4,
  fontWeight: 900,
};

const correctionMovementStyle: CSSProperties = {
  padding: "6px 9px",
  borderRadius: 999,
  color: "#bfdbfe",
  background: "rgba(37,99,235,0.2)",
  border: "1px solid rgba(96,165,250,0.25)",
  fontSize: 11,
  fontWeight: 950,
};

const correctionDescriptionStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#cbd5e1",
  fontSize: 12,
  lineHeight: 1.5,
  fontWeight: 700,
};

const correctionSavingStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#86efac",
  fontSize: 12,
  fontWeight: 900,
};

function getReadyPanelStyle(
  status: RouteProAmazonAssistDashboardModel["readyStatus"],
): CSSProperties {
  if (status === "ready") {
    return {
      ...sectionStyle,
      background: "rgba(22,163,74,0.13)",
      border: "1px solid rgba(74,222,128,0.34)",
    };
  }

  if (status === "ready_with_attention") {
    return {
      ...sectionStyle,
      background: "rgba(217,119,6,0.13)",
      border: "1px solid rgba(251,191,36,0.3)",
    };
  }

  return {
    ...sectionStyle,
    background: "rgba(225,29,72,0.12)",
    border: "1px solid rgba(251,113,133,0.3)",
  };
}

function buildStars(stars: number): string {
  const safeStars = Math.max(0, Math.min(5, Math.round(stars)));

  return `${"★".repeat(safeStars)}${"☆".repeat(5 - safeStars)}`;
}

export function RouteProAmazonAssistDashboard({
  dashboard,
}: Props) {
  return (
    <section style={shellStyle}>
      <p style={eyebrowStyle}>
        Amazon Assist · Driver Intelligence
      </p>

      <h2 style={titleStyle}>La rotta, spiegata chiaramente</h2>

      <p style={bodyStyle}>
        RoutePro confronta la sequenza originale con quella finale e mostra
        soltanto i miglioramenti realmente misurati.
      </p>

      <div style={heroGridStyle}>
        <article style={scoreCardStyle}>
          <p style={metricLabelStyle}>Route Health Score</p>

          <div style={scoreValueRowStyle}>
            <span style={scoreValueStyle}>{dashboard.finalScore}</span>
            <span style={scoreTotalStyle}>/100</span>
          </div>

          <span style={improvementBadgeStyle}>
            {dashboard.scoreImprovement > 0
              ? `${dashboard.scoreImprovementLabel} punti`
              : dashboard.scoreImprovementLabel}
          </span>
        </article>

        <article style={narrativeCardStyle}>
          <h3 style={qualityStyle}>{dashboard.qualityLabel}</h3>

          <div
            style={starsStyle}
            aria-label={`${dashboard.stars} stelle su 5`}
          >
            {buildStars(dashboard.stars)}
          </div>

          <p style={bodyStyle}>{dashboard.headline}</p>
          <p style={bodyStyle}>{dashboard.summary}</p>

          <div style={progressTrackStyle}>
            <div
              style={{
                width: `${dashboard.finalScore}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
              }}
            />
          </div>
        </article>
      </div>

      <div style={metricsGridStyle}>
        {dashboard.metrics.map((metric) => (
          <article key={metric.key} style={metricCardStyle}>
            <p style={metricLabelStyle}>{metric.label}</p>
            <p style={metricValueStyle}>{metric.value}</p>

            {metric.helper ? (
              <p style={metricHelperStyle}>{metric.helper}</p>
            ) : null}
          </article>
        ))}
      </div>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Prima → Dopo → Pronto</h3>

        <div style={timelineStyle}>
          <article style={timelineCardStyle}>
            <p style={timelineLabelStyle}>Sequenza originale</p>
            <p style={timelineValueStyle}>
              {dashboard.originalScore}
            </p>
          </article>

          <article style={timelineCardStyle}>
            <p style={timelineLabelStyle}>Amazon Assist</p>
            <p style={timelineValueStyle}>{dashboard.finalScore}</p>
          </article>

          <article style={timelineCardStyle}>
            <p style={timelineLabelStyle}>Stato</p>
            <p
              style={{
                ...timelineValueStyle,
                fontSize: 15,
                lineHeight: 1.25,
                color:
                  dashboard.readyStatus === "ready"
                    ? "#86efac"
                    : dashboard.readyStatus ===
                        "ready_with_attention"
                      ? "#fde68a"
                      : "#fda4af",
              }}
            >
              {dashboard.readyLabel}
            </p>
          </article>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Anomalie della sequenza</h3>

        <p style={bodyStyle}>
          Prima: {dashboard.originalAnomalies} · Dopo:{" "}
          {dashboard.finalAnomalies} · Eliminate:{" "}
          {dashboard.anomaliesRemoved}
        </p>

        <div style={anomalyGridStyle}>
          <article style={anomalyCardStyle}>
            <p style={metricLabelStyle}>Ritorni sulla stessa via</p>
            <p style={anomalyValueStyle}>
              {dashboard.streetRevisitsBefore} →{" "}
              {dashboard.streetRevisitsAfter}
            </p>
          </article>

          <article style={anomalyCardStyle}>
            <p style={metricLabelStyle}>Ritorni ravvicinati</p>
            <p style={anomalyValueStyle}>
              {dashboard.nearbyRevisitsBefore} →{" "}
              {dashboard.nearbyRevisitsAfter}
            </p>
          </article>

          <article style={anomalyCardStyle}>
            <p style={metricLabelStyle}>Salti di percorso</p>
            <p style={anomalyValueStyle}>
              {dashboard.routeJumpsBefore} →{" "}
              {dashboard.routeJumpsAfter}
            </p>
          </article>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Driver Coach</h3>

        <ul style={tipsListStyle}>
          {dashboard.driverTips.map((tip, index) => (
            <li key={`${index}-${tip}`} style={tipStyle}>
              ✓ {tip}
            </li>
          ))}
        </ul>
      </section>

      {dashboard.corrections.length > 0 ? (
        <details style={sectionStyle}>
          <summary
            style={{
              ...sectionTitleStyle,
              cursor: "pointer",
            }}
          >
            Correzioni applicate ({dashboard.correctionCount})
          </summary>

          <ul style={correctionListStyle}>
            {dashboard.corrections.map((correction) => (
              <li key={correction.id} style={correctionCardStyle}>
                <div style={correctionHeaderStyle}>
                  <span style={correctionTypeStyle}>
                    ✓ {correction.typeLabel}
                  </span>

                  <span style={correctionMovementStyle}>
                    {correction.movementLabel}
                  </span>
                </div>

                <p style={correctionDescriptionStyle}>
                  {correction.description}
                </p>

                <p style={correctionSavingStyle}>
                  Risparmio geometrico stimato:{" "}
                  {correction.savingLabel}
                </p>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            Sequenza originale preservata
          </h3>

          <p style={bodyStyle}>
            RoutePro non ha trovato spostamenti abbastanza sicuri e
            vantaggiosi da applicare automaticamente.
          </p>
        </section>
      )}

      <section style={getReadyPanelStyle(dashboard.readyStatus)}>
        <p style={eyebrowStyle}>Preparazione alla guida</p>

        <h3 style={{ ...sectionTitleStyle, marginTop: 8 }}>
          {dashboard.readyLabel}
        </h3>

        <p style={bodyStyle}>{dashboard.readyDescription}</p>
        <p style={bodyStyle}>{dashboard.recommendationLabel}</p>
      </section>

      <details style={sectionStyle}>
        <summary
          style={{
            ...sectionTitleStyle,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Come lavora Amazon Assist
        </summary>

        <p style={bodyStyle}>{dashboard.automationDescription}</p>
      </details>
    </section>
  );
}
