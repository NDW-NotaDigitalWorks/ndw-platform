const fs = require("fs");
const path = require("path");

const root = process.cwd();

const optimizePagePath = path.join(
  root,
  "src/app/app/routepro/routes/[routeId]/optimize/page.tsx"
);

const dashboardPath = path.join(
  root,
  "src/modules/routepro/ui/RouteProAmazonAssistDashboard.tsx"
);

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File non trovato: ${filePath}`);
  }
}

function replaceOnce(content, search, replacement, label) {
  const count = content.split(search).length - 1;

  if (count !== 1) {
    throw new Error(
      `${label}: attesa 1 corrispondenza, trovate ${count}. Nessun file modificato.`
    );
  }

  return content.replace(search, replacement);
}

requireFile(optimizePagePath);

const originalPage = fs.readFileSync(optimizePagePath, "utf8");
const eol = originalPage.includes("\r\n") ? "\r\n" : "\n";

function withEol(value) {
  return value.replace(/\n/g, eol);
}

if (originalPage.includes("RouteProAmazonAssistDashboard")) {
  throw new Error(
    "La pagina contiene già RouteProAmazonAssistDashboard. Intervento interrotto."
  );
}

if (fs.existsSync(dashboardPath)) {
  throw new Error(
    `Il componente esiste già: ${dashboardPath}. Intervento interrotto.`
  );
}

const dashboardContent = `import type { RouteProAmazonAssistReport } from "@/modules/routepro/server/routepro.routes";

type Props = {
  report: RouteProAmazonAssistReport;
};

const panelStyle: React.CSSProperties = {
  marginTop: 24,
  padding: 18,
  borderRadius: 24,
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.99) 0%, rgba(30,41,59,0.98) 100%)",
  border: "1px solid rgba(96,165,250,0.28)",
  boxShadow: "0 22px 52px rgba(15,23,42,0.2)",
  color: "#ffffff",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const titleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 25,
  lineHeight: 1.15,
  fontWeight: 950,
};

const textStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 700,
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
  gap: 10,
  marginTop: 18,
};

const metricStyle: React.CSSProperties = {
  minWidth: 0,
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(148,163,184,0.2)",
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const metricValueStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#ffffff",
  fontSize: 25,
  lineHeight: 1,
  fontWeight: 950,
};

const scoreRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 16,
  marginTop: 18,
};

const scoreStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 4,
  minWidth: 118,
  padding: "15px 17px",
  borderRadius: 20,
  background: "rgba(37,99,235,0.2)",
  border: "1px solid rgba(96,165,250,0.4)",
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: 37,
  lineHeight: 1,
  fontWeight: 950,
  color: "#ffffff",
};

const scoreTotalStyle: React.CSSProperties = {
  color: "#93c5fd",
  fontSize: 14,
  fontWeight: 900,
};

const improvementStyle: React.CSSProperties = {
  flex: "1 1 210px",
  minWidth: 0,
};

const progressTrackStyle: React.CSSProperties = {
  height: 9,
  marginTop: 10,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(148,163,184,0.2)",
};

const sectionStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 20,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 17,
  lineHeight: 1.25,
  fontWeight: 950,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 9,
  margin: "13px 0 0",
  padding: 0,
  listStyle: "none",
};

const correctionStyle: React.CSSProperties = {
  padding: "11px 12px",
  borderRadius: 14,
  background: "rgba(15,23,42,0.54)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const correctionTitleStyle: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: 13,
  lineHeight: 1.4,
  fontWeight: 850,
};

const correctionMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#93c5fd",
  fontSize: 12,
  lineHeight: 1.4,
  fontWeight: 800,
};

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return \`\${(meters / 1000).toFixed(1).replace(".", ",")} km\`;
  }

  return \`\${Math.max(0, Math.round(meters))} m\`;
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return \`\${remainingSeconds} sec\`;
  }

  if (remainingSeconds === 0) {
    return \`\${minutes} min\`;
  }

  return \`\${minutes} min \${remainingSeconds} sec\`;
}

function getRecommendationLabel(
  recommendation: RouteProAmazonAssistReport["final_analysis"]["recommendation"],
): string {
  switch (recommendation) {
    case "no_change_recommended":
      return "Percorso già ben organizzato";

    case "minor_corrections_available":
      return "Piccole correzioni ancora possibili";

    case "optimization_recommended":
      return "Ulteriore ottimizzazione consigliata";

    case "strong_optimization_recommended":
      return "Ottimizzazione importante consigliata";

    default:
      return "Analisi completata";
  }
}

function getCorrectionTypeLabel(
  type: RouteProAmazonAssistReport["corrections"][number]["type"],
): string {
  switch (type) {
    case "street_revisit":
      return "Ritorno sulla stessa via";

    case "nearby_stop_revisit":
      return "Ritorno in una zona vicina";

    case "route_jump":
      return "Salto di percorso";

    default:
      return "Correzione";
  }
}

export function RouteProAmazonAssistDashboard({ report }: Props) {
  const originalScore = report.original_analysis.routeScore;
  const finalScore = report.final_analysis.routeScore;
  const scoreImprovement = Math.max(0, finalScore - originalScore);
  const finalProgress = Math.max(0, Math.min(100, finalScore));

  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>Amazon Assist · Driver Intelligence</p>
      <h2 style={titleStyle}>Analisi intelligente della sequenza</h2>
      <p style={textStyle}>
        RoutePro ha confrontato la sequenza originale con quella corretta,
        mantenendo fissi partenza e rientro.
      </p>

      <div style={scoreRowStyle}>
        <div style={scoreStyle}>
          <span style={scoreValueStyle}>{finalScore}</span>
          <span style={scoreTotalStyle}>/100</span>
        </div>

        <div style={improvementStyle}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 14,
              lineHeight: 1.4,
              fontWeight: 900,
            }}
          >
            Route Score finale
          </div>

          <div style={textStyle}>
            Prima {originalScore}/100
            {scoreImprovement > 0
              ? \` · miglioramento +\${scoreImprovement}\`
              : " · sequenza originale preservata"}
          </div>

          <div style={progressTrackStyle}>
            <div
              style={{
                width: \`\${finalProgress}%\`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
              }}
            />
          </div>
        </div>
      </div>

      <div style={metricsGridStyle}>
        <article style={metricStyle}>
          <p style={metricLabelStyle}>Correzioni</p>
          <p style={metricValueStyle}>{report.corrections.length}</p>
        </article>

        <article style={metricStyle}>
          <p style={metricLabelStyle}>Stop riposizionati</p>
          <p style={metricValueStyle}>{report.changed_stop_count}</p>
        </article>

        <article style={metricStyle}>
          <p style={metricLabelStyle}>Distanza evitata</p>
          <p style={metricValueStyle}>
            {formatDistance(report.applied_saving_meters)}
          </p>
        </article>

        <article style={metricStyle}>
          <p style={metricLabelStyle}>Tempo stimato</p>
          <p style={metricValueStyle}>
            {formatDuration(report.applied_saving_seconds)}
          </p>
        </article>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>
          {getRecommendationLabel(report.final_analysis.recommendation)}
        </h3>

        <p style={textStyle}>
          Anomalie rilevate dopo la correzione:{" "}
          {report.final_analysis.counts.total}. Prima dell’intervento erano{" "}
          {report.original_analysis.counts.total}.
        </p>

        <div style={metricsGridStyle}>
          <article style={metricStyle}>
            <p style={metricLabelStyle}>Ritorni su vie</p>
            <p style={metricValueStyle}>
              {report.final_analysis.counts.streetRevisits}
            </p>
          </article>

          <article style={metricStyle}>
            <p style={metricLabelStyle}>Ritorni ravvicinati</p>
            <p style={metricValueStyle}>
              {report.final_analysis.counts.nearbyStopRevisits}
            </p>
          </article>

          <article style={metricStyle}>
            <p style={metricLabelStyle}>Salti di percorso</p>
            <p style={metricValueStyle}>
              {report.final_analysis.counts.routeJumps}
            </p>
          </article>
        </div>
      </div>

      {report.corrections.length > 0 ? (
        <details style={sectionStyle}>
          <summary
            style={{
              ...sectionTitleStyle,
              cursor: "pointer",
            }}
          >
            Correzioni applicate ({report.corrections.length})
          </summary>

          <ul style={listStyle}>
            {report.corrections.map((correction, index) => (
              <li
                key={\`\${correction.stopId}-\${index}\`}
                style={correctionStyle}
              >
                <div style={correctionTitleStyle}>
                  ✓ {getCorrectionTypeLabel(correction.type)}
                </div>

                <div style={correctionMetaStyle}>
                  Posizione {correction.previousIndex + 1} →{" "}
                  {correction.nextIndex + 1} ·{" "}
                  {formatDistance(correction.savingMeters)} stimati
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Nessuna correzione automatica necessaria</h3>
          <p style={textStyle}>
            Amazon Assist non ha trovato spostamenti sufficientemente sicuri e
            vantaggiosi da applicare automaticamente.
          </p>
        </div>
      )}
    </section>
  );
}
`;

let nextPage = originalPage;

nextPage = replaceOnce(
  nextPage,
  `import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";`,
  withEol(`import { RouteProSubmitButton } from "@/modules/routepro/ui/RouteProSubmitButton";
import { RouteProAmazonAssistDashboard } from "@/modules/routepro/ui/RouteProAmazonAssistDashboard";`),
  "Import dashboard"
);

nextPage = replaceOnce(
  nextPage,
  `  const optimizationCompleted =
    route.is_optimized || resolvedSearchParams?.optimized === "1";`,
  withEol(`  const optimizationCompleted =
    route.is_optimized || resolvedSearchParams?.optimized === "1";

  const isAmazonAssistRoute =
    String(route.route_profile ?? "").toLowerCase() === "amazon_flex";

  const amazonAssistReport =
    isAmazonAssistRoute ? route.amazon_assist_report : null;`),
  "Preparazione report dashboard"
);

nextPage = replaceOnce(
  nextPage,
  `<input type="hidden" name="route_id" value={route.id} />`,
  withEol(`<input type="hidden" name="route_id" value={route.id} />
                <input type="hidden" name="workflow" value="v2" />`),
  "Workflow V2 hidden input"
);

nextPage = replaceOnce(
  nextPage,
  `      <div style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Ottimizza la rotta</h2>`,
  withEol(`      {amazonAssistReport ? (
        <RouteProAmazonAssistDashboard report={amazonAssistReport} />
      ) : isAmazonAssistRoute && optimizationCompleted ? (
        <div style={{ ...whiteCardStyle, marginTop: 24 }}>
          <h2 style={{ ...sectionTitleStyle, fontSize: 21 }}>
            Driver Intelligence non ancora disponibile
          </h2>
          <p style={sectionTextStyle}>
            Questa rotta era stata ottimizzata prima dell’introduzione del
            report Amazon Assist. Una nuova analisi genererà i dati della
            dashboard.
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: 28 }}>
        <h2 style={sectionTitleStyle}>Ottimizza la rotta</h2>`),
  "Inserimento dashboard"
);

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

fs.copyFileSync(
  optimizePagePath,
  `${optimizePagePath}.driver-intelligence-${timestamp}.backup`
);

fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
fs.writeFileSync(dashboardPath, withEol(dashboardContent), "utf8");
fs.writeFileSync(optimizePagePath, nextPage, "utf8");

console.log("");
console.log("Driver Intelligence Dashboard installata:");
console.log("- creato RouteProAmazonAssistDashboard.tsx");
console.log("- aggiornata la pagina Optimize");
console.log("- aggiunto workflow=v2 al form");
console.log("- backup locale creato");
console.log("");
console.log("Ora esegui: npm run build");
