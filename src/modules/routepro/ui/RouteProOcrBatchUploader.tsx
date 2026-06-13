"use client";

import { useMemo, useState } from "react";
import { addScreenshotOcrRouteProStops } from "@/modules/routepro/server/routepro.actions";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

type ParsedStop = {
  originalPosition: number;
  address: string;
  city: string | null;
};

type SuspiciousStop = {
  originalPosition: number;
  address: string;
  reasons: string[];
};

type DuplicateStopReport = {
  originalPosition: number;
  keptAddress: string;
  duplicateAddress: string;
};

type ImportReport = {
  totalFiles: number;
  processedFiles: number;
  failedFiles: string[];
  extractedStopsBeforeDeduplication: number;
  extractedStops: number;
  duplicateStopsIgnored: number;
  duplicateStops: DuplicateStopReport[];
};

type ApiSuccessResponse = {
  ok: true;
  parsedStops: ParsedStop[];
  fallbackTexts: string[];
  importReport: ImportReport;
};

type ApiErrorResponse = {
  ok: false;
  error: string;
  message?: string;
};

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

type Props = {
  routeId: string;
};

const BATCH_SIZE = 5;

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 20,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.65,
  opacity: 0.86,
};

const warningStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(245, 158, 11, 0.28)",
  background: "rgba(245, 158, 11, 0.10)",
  color: "#fbbf24",
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(244, 63, 94, 0.28)",
  background: "rgba(244, 63, 94, 0.10)",
  color: "#fda4af",
  fontWeight: 700,
};

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];

  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }

  return chunks;
}

function getUniqueOrderedStops(stops: ParsedStop[]): ParsedStop[] {
  const unique = new Map<number, ParsedStop>();

  for (const stop of stops) {
    if (!unique.has(stop.originalPosition)) {
      unique.set(stop.originalPosition, stop);
    }
  }

  return Array.from(unique.values()).sort(
    (a, b) => a.originalPosition - b.originalPosition,
  );
}

function formatStopsForTextarea(stops: ParsedStop[]): string {
  return getUniqueOrderedStops(stops)
    .map((stop) => {
      const cityPart = stop.city ? `, ${stop.city}` : "";
      return `${stop.originalPosition} | ${stop.address}${cityPart}`;
    })
    .join("\n");
}

function findMissingStopNumbers(stops: ParsedStop[]): number[] {
  const orderedStops = getUniqueOrderedStops(stops);

  if (orderedStops.length < 2) {
    return [];
  }

  const numbers = orderedStops.map((stop) => stop.originalPosition);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const existing = new Set(numbers);
  const missing: number[] = [];

  for (let value = min; value <= max; value += 1) {
    if (!existing.has(value)) {
      missing.push(value);
    }
  }

  return missing;
}

function detectSuspiciousStops(stops: ParsedStop[]): SuspiciousStop[] {
  const suspicious: SuspiciousStop[] = [];

  for (const stop of getUniqueOrderedStops(stops)) {
    const reasons: string[] = [];
    const address = stop.address.trim();
    const lower = address.toLowerCase();

    if (address.length < 6) {
  reasons.push("indirizzo molto corto");
}

    if (!/\d/.test(address) && !lower.includes("snc")) {
  reasons.push("manca numero civico");
}

    if (!stop.city && !/\d/.test(address)) {
  reasons.push("città non rilevata");
}

    if (
      address.includes("...") ||
      lower.includes(" mon...") ||
      lower.includes(" indicazio") ||
      lower.includes(" supermercat") ||
      lower.includes(" corpor") ||
      lower.includes(" calzet") ||
      lower.includes(" citofono ...")
    ) {
      reasons.push("testo probabilmente tagliato");
    }

    if (reasons.length > 0) {
      suspicious.push({
        originalPosition: stop.originalPosition,
        address,
        reasons,
      });
    }
  }

  return suspicious;
}

export function RouteProOcrBatchUploader({ routeId }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [previewText, setPreviewText] = useState("");
  const [parsedStops, setParsedStops] = useState<ParsedStop[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importReport, setImportReport] =
  useState<ImportReport | null>(null);

  const batches = useMemo(() => chunkFiles(files, BATCH_SIZE), [files]);
  const totalBatches = batches.length;
  const progress =
    totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0;

  const missingStopNumbers = useMemo(
    () => findMissingStopNumbers(parsedStops),
    [parsedStops],
  );

  const suspiciousStops = useMemo(
    () => detectSuspiciousStops(parsedStops),
    [parsedStops],
  );

  async function handleProcessScreenshots() {
    if (files.length === 0) {
      setErrorMessage("Seleziona almeno uno screenshot.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPreviewText("");
    setParsedStops([]);
    setImportReport(null);
    setCurrentBatch(0);

    const allStops: ParsedStop[] = [];
    const fallbackTexts: string[] = [];
    let latestImportReport: ImportReport | null = null;

    try {
      for (let index = 0; index < batches.length; index += 1) {
        const batch = batches[index];
        const formData = new FormData();

        for (const file of batch) {
          formData.append("screenshot_file", file);
        }

        const response = await fetch("/api/routepro/ocr-batch", {
          method: "POST",
          body: formData,
        });

        const json = (await response.json()) as ApiResponse;

        if (!response.ok || !json.ok) {
          throw new Error(
            !json.ok && json.message
              ? json.message
              : "Errore durante la lettura degli screenshot.",
          );
        }

        allStops.push(...json.parsedStops);
        fallbackTexts.push(...json.fallbackTexts);
        latestImportReport = json.importReport;

        setCurrentBatch(index + 1);
      }

      const formattedStops = formatStopsForTextarea(allStops);

      setParsedStops(getUniqueOrderedStops(allStops));

      setImportReport(latestImportReport);

      if (formattedStops.length > 0) {
        setPreviewText(formattedStops);
      } else {
        setPreviewText(fallbackTexts.join("\n\n--- screenshot ---\n\n"));
      }
    } catch (error) {
      console.error("RoutePro client OCR batch error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Errore durante la lettura degli screenshot.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
  <div
    style={{
      marginTop: 24,
      padding: 28,
      borderRadius: 28,
      border: "1px solid rgba(59,130,246,.35)",
      background:
        "linear-gradient(180deg,#16255f 0%,#203b9b 100%)",
      boxShadow:
        "0 24px 60px rgba(0,0,0,.25)",
    }}
  >
      <p
  style={{
    color: "#ff8a00",
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: "uppercase",
    margin: 0,
  }}
>
  OCR ROUTE IMPORT
</p>
      <h2
  style={{
    marginTop: 12,
    marginBottom: 12,
    color: "#fff",
    fontSize: 34,
    fontWeight: 900,
  }}
>
  Multi Screenshot Recognition
</h2>

      <p
  style={{
    color: "rgba(255,255,255,.85)",
    lineHeight: 1.7,
    marginBottom: 24,
  }}
>
        Import screenshots and automatically create a route. RoutePro extracts
addresses, stop order and route data, preparing the workflow for
verification and optimization.
      </p>

      <div style={formStyle}>
        <label
  style={{
    ...ui.form.label,
    color: "#dbeafe",
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: "0.04em",
  }}
>
  Route screenshots
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={{
  ...ui.form.input,
  minHeight: 48,
  padding: 12,
}}
            disabled={isProcessing}
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? []);
              setFiles(selectedFiles);
              setPreviewText("");
              setParsedStops([]);
              setErrorMessage(null);
              setCurrentBatch(0);
            }}
          />
        </label>

        {files.length > 0 ? (
          <p style={mutedTextStyle}>
            Files selected: <strong>{files.length}</strong> · OCR batches: <strong>{totalBatches}</strong>
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleProcessScreenshots}
          disabled={isProcessing || files.length === 0}
          style={{
  ...routeProUi.primaryButton,
  minHeight: 52,
  background: "#ff7a00",
  borderColor: "#ff7a00",
  color: "#ffffff",
  boxShadow: "0 14px 34px rgba(255,122,0,0.32)",
  opacity: isProcessing || files.length === 0 ? 0.65 : 1,
  cursor: isProcessing || files.length === 0 ? "not-allowed" : "pointer",
}}
        >
          {isProcessing ? "Lettura screenshot in corso..." : "Start OCR Analysis"}
        </button>
      </div>

      {isProcessing ? (
        <div style={{ ...ui.card.base, marginTop: 18 }}>
          <p style={{ margin: 0, fontWeight: 800 }}>
            Sto leggendo batch {currentBatch + 1} di {totalBatches}
          </p>

          <div
            style={{
              height: 10,
              marginTop: 12,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 999,
                background: "linear-gradient(135deg, #ff7a00, #ffb347)",
                transition: "width 180ms ease",
              }}
            />
          </div>

          <p style={mutedTextStyle}>
            Progresso: {progress}% · Non chiudere questa pagina.
          </p>
        </div>
      ) : null}

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {importReport ? (
  <div style={{ ...ui.card.base, marginTop: 18 }}>
    <h3 style={{ marginTop: 0 }}>OCR import report</h3>

    <p style={mutedTextStyle}>
      {importReport.extractedStops} stops extracted from{" "}
      {importReport.processedFiles} screenshots.
    </p>

    {importReport.duplicateStopsIgnored > 0 ? (
      <div style={warningStyle}>
        {importReport.duplicateStopsIgnored} duplicate stops ignored.
      </div>
    ) : null}

    {importReport.failedFiles.length > 0 ? (
      <div style={errorStyle}>
        {importReport.failedFiles.length} screenshots failed OCR.
      </div>
    ) : null}

    {importReport.duplicateStops.length > 0 ? (
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800 }}>
          View duplicate stops
        </summary>

        <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
          {importReport.duplicateStops.slice(0, 12).map((duplicate) => (
            <li key={`${duplicate.originalPosition}-${duplicate.duplicateAddress}`}>
              Stop {duplicate.originalPosition}: kept{" "}
              <strong>{duplicate.keptAddress}</strong>, ignored{" "}
              <strong>{duplicate.duplicateAddress}</strong>
            </li>
          ))}
        </ul>
      </details>
    ) : null}
  </div>
) : null}

      {previewText ? (
        <div style={{ ...ui.card.base, marginTop: 18 }}>
          <h3 style={{ marginTop: 0 }}>Preview OCR pulita</h3>

          {missingStopNumbers.length > 0 ? (
            <div style={warningStyle}>
              Numeri stop mancanti nella sequenza:{" "}
              {missingStopNumbers.join(", ")}
            </div>
          ) : null}

          {suspiciousStops.length > 0 ? (
            <div style={warningStyle}>
              <p style={{ margin: 0 }}>
                Indirizzi da controllare: {suspiciousStops.length}
              </p>

              <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                {suspiciousStops.slice(0, 12).map((stop) => (
                  <li key={stop.originalPosition}>
                    Stop {stop.originalPosition}: {stop.address} —{" "}
                    {stop.reasons.join(", ")}
                  </li>
                ))}
              </ul>

              {suspiciousStops.length > 12 ? (
                <p style={{ margin: "10px 0 0" }}>
                  + altri {suspiciousStops.length - 12} indirizzi da controllare
                  nella textarea.
                </p>
              ) : null}
            </div>
          ) : null}

          <p style={mutedTextStyle}>
            Controlla le righe segnalate, correggi eventuali errori nella textarea
            e poi conferma l’import.
          </p>

          <form action={addScreenshotOcrRouteProStops} style={formStyle}>
            <input type="hidden" name="route_id" value={routeId} />

            <label style={ui.form.label}>
              Stop da importare
              <textarea
                name="ocr_addresses"
                rows={12}
                defaultValue={previewText}
                style={{
                  ...ui.form.input,
                  resize: "vertical",
fontFamily:
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
minHeight: 260,
lineHeight: 1.6,
                }}
              />
            </label>

            <button
  type="submit"
  style={{
    ...routeProUi.primaryButton,
    minHeight: 48,
    width: "fit-content",
  }}
>
  Importa stop da screenshot
</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}