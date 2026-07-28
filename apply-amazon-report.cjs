const fs = require("fs");
const path = require("path");

const root = process.cwd();

const actionsPath = path.join(
  root,
  "src/modules/routepro/server/routepro.actions.ts"
);

const routesPath = path.join(
  root,
  "src/modules/routepro/server/routepro.routes.ts"
);

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File non trovato: ${filePath}`);
  }
}

function replaceRegexOnce(content, regex, replacement, label) {
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;

  if (count !== 1) {
    throw new Error(
      `${label}: attesa 1 corrispondenza, trovate ${count}. Nessun file salvato.`
    );
  }

  return content.replace(regex, replacement);
}

function replaceRegexCount(content, regex, replacement, expected, label) {
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;

  if (count !== expected) {
    throw new Error(
      `${label}: attese ${expected} corrispondenze, trovate ${count}. Nessun file salvato.`
    );
  }

  return content.replace(regex, replacement);
}

requireFile(actionsPath);
requireFile(routesPath);

const originalActions = fs.readFileSync(actionsPath, "utf8");
const originalRoutes = fs.readFileSync(routesPath, "utf8");

if (originalRoutes.includes("RouteProAmazonAssistReport")) {
  throw new Error(
    "routepro.routes.ts contiene già RouteProAmazonAssistReport. Intervento interrotto per evitare duplicazioni."
  );
}

if (originalActions.includes("amazonAssistReport = {")) {
  throw new Error(
    "routepro.actions.ts contiene già la persistenza Amazon Assist. Intervento interrotto per evitare duplicazioni."
  );
}

const routesEol = originalRoutes.includes("\r\n") ? "\r\n" : "\n";
const actionsEol = originalActions.includes("\r\n") ? "\r\n" : "\n";

function withEol(text, eol) {
  return text.replace(/\n/g, eol);
}

let routes = originalRoutes;
let actions = originalActions;

// ============================================================
// routepro.routes.ts
// ============================================================

routes = replaceRegexOnce(
  routes,
  /import \{ createClient \} from "@\/lib\/supabase\/server";/,
  withEol(
    `import { createClient } from "@/lib/supabase/server";
import type { AmazonAssistAnalysisResult } from "@/modules/routepro/server/routepro.amazon-analysis";
import type { AmazonAssistAppliedCorrection } from "@/modules/routepro/server/routepro.amazon-optimizer";`,
    routesEol
  ),
  "Import tipi Amazon Assist"
);

routes = replaceRegexOnce(
  routes,
  /export type RouteProStopSource = "manual" \| "paste" \| "csv" \| "screenshot";\r?\n\r?\nexport type RouteProRouteSummary = \{/,
  withEol(
    `export type RouteProStopSource = "manual" | "paste" | "csv" | "screenshot";

export type RouteProAmazonAssistReport = {
  version: 1;
  generated_at: string;
  method: string;
  changed: boolean;
  changed_stop_count: number;
  applied_saving_meters: number;
  applied_saving_seconds: number;
  original_analysis: AmazonAssistAnalysisResult;
  final_analysis: AmazonAssistAnalysisResult;
  corrections: AmazonAssistAppliedCorrection[];
};

export type RouteProRouteSummary = {`,
    routesEol
  ),
  "Tipo report Amazon Assist"
);

routes = replaceRegexOnce(
  routes,
  /  optimization_method: string \| null;\r?\n  created_at: string;/,
  withEol(
    `  optimization_method: string | null;
  amazon_assist_report: RouteProAmazonAssistReport | null;
  created_at: string;`,
    routesEol
  ),
  "Campo amazon_assist_report"
);

routes = replaceRegexCount(
  routes,
  /      optimization_method,\r?\n      created_at,/g,
  withEol(
    `      optimization_method,
      amazon_assist_report,
      created_at,`,
    routesEol
  ),
  2,
  "Select routepro_routes"
);

// ============================================================
// routepro.actions.ts
// ============================================================

actions = replaceRegexOnce(
  actions,
  /import \{ analyzeAmazonRoute \} from "@\/modules\/routepro\/server\/routepro\.amazon-analysis";\r?\n/,
  "",
  "Rimozione import analyzeAmazonRoute non utilizzato"
);

actions = replaceRegexOnce(
  actions,
  /  let optimizedStops = optimizationStops;\r?\n\r?\nlet optimizationMethod = "analysis_only";/,
  withEol(
    `  let optimizedStops = optimizationStops;

let optimizationMethod = "analysis_only";

let amazonAssistReport: {
  version: 1;
  generated_at: string;
  method: string;
  changed: boolean;
  changed_stop_count: number;
  applied_saving_meters: number;
  applied_saving_seconds: number;
  original_analysis: unknown;
  final_analysis: unknown;
  corrections: unknown[];
} | null = null;`,
    actionsEol
  ),
  "Variabile amazonAssistReport"
);

actions = replaceRegexOnce(
  actions,
  /  optimizedStops = amazonResult\.orderedStops\r?\n  \.map\(\(amazonStop\) =>\r?\n    optimizationStops\.find\(\(stop\) => stop\.id === amazonStop\.id\),\r?\n  \)\r?\n  \.filter\(\r?\n    \(\r?\n      stop,\r?\n    \): stop is \(typeof optimizationStops\)\[number\] => Boolean\(stop\),\r?\n  \);\r?\n  optimizationMethod = amazonResult\.method;/,
  withEol(
    `  amazonAssistReport = {
    version: 1,
    generated_at: new Date().toISOString(),
    method: amazonResult.method,
    changed: amazonResult.changed,
    changed_stop_count: amazonResult.changedStopCount,
    applied_saving_meters: amazonResult.appliedSavingMeters,
    applied_saving_seconds: amazonResult.appliedSavingSeconds,
    original_analysis: amazonResult.originalAnalysis,
    final_analysis: amazonResult.analysis,
    corrections: amazonResult.corrections,
  };

  optimizedStops = amazonResult.orderedStops
    .map((amazonStop) =>
      optimizationStops.find((stop) => stop.id === amazonStop.id),
    )
    .filter(
      (
        stop,
      ): stop is (typeof optimizationStops)[number] => Boolean(stop),
    );

  optimizationMethod = amazonResult.method;`,
    actionsEol
  ),
  "Creazione report Amazon Assist"
);

actions = replaceRegexOnce(
  actions,
  /      optimization_method: optimizationMethod,\r?\n      updated_at: new Date\(\)\.toISOString\(\),/,
  withEol(
    `      optimization_method: optimizationMethod,
      amazon_assist_report: amazonAssistReport,
      updated_at: new Date().toISOString(),`,
    actionsEol
  ),
  "Salvataggio report routepro_routes"
);

// Scrittura solo dopo che tutti i controlli sono stati superati.
const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

fs.copyFileSync(
  actionsPath,
  `${actionsPath}.amazon-report-${timestamp}.backup`
);

fs.copyFileSync(
  routesPath,
  `${routesPath}.amazon-report-${timestamp}.backup`
);

fs.writeFileSync(routesPath, routes, "utf8");
fs.writeFileSync(actionsPath, actions, "utf8");

console.log("");
console.log("Modifica completata correttamente:");
console.log("- routepro.routes.ts aggiornato");
console.log("- routepro.actions.ts aggiornato");
console.log("- amazon_assist_report incluso nelle query");
console.log("- backup locali creati");
console.log("");
console.log("Ora esegui: npm run build");
