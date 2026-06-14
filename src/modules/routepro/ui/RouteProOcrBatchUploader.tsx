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

function updateEditableStopAddress(
  stops: ParsedStop[],
  originalPosition: number,
  address: string,
): ParsedStop[] {
  return stops.map((stop) =>
    stop.originalPosition === originalPosition
      ? { ...stop, address }
      : stop,
  );
}

function formatEditableStopsForImport(stops: ParsedStop[]): string {
  return getUniqueOrderedStops(stops)
    .map((stop) => {
      const cityPart = stop.city ? `, ${stop.city}` : "";
      return `${stop.originalPosition} | ${stop.address}${cityPart}`;
    })
    .join("\n");
}

export function RouteProOcrBatchUploader({ routeId }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [previewText, setPreviewText] = useState("");
  const [parsedStops, setParsedStops] = useState<ParsedStop[]>([]);
  const [editableStops, setEditableStops] = useState<ParsedStop[]>([]);
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

  const suspiciousStopNumbers = useMemo(
  () => new Set(suspiciousStops.map((stop) => stop.originalPosition)),
  [suspiciousStops],
);

const problemEditableStops = useMemo(
  () =>
    editableStops.filter((stop) =>
      suspiciousStopNumbers.has(stop.originalPosition),
    ),
  [editableStops, suspiciousStopNumbers],
);

const readyEditableStops = useMemo(
  () =>
    editableStops.filter(
      (stop) => !suspiciousStopNumbers.has(stop.originalPosition),
    ),
  [editableStops, suspiciousStopNumbers],
);

const importText = useMemo(
  () => formatEditableStopsForImport(editableStops),
  [editableStops],
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
    setEditableStops([]);
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
      setEditableStops(getUniqueOrderedStops(allStops));

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
    <h3 style={{ marginTop: 0 }}>OCR Control Room</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginTop: 14,
      }}
    >
      <div style={warningStyle}>
        <strong>Stop letti</strong>
        <div style={{ fontSize: 28, marginTop: 6 }}>{editableStops.length}</div>
      </div>

      <div style={warningStyle}>
        <strong>Da controllare</strong>
        <div style={{ fontSize: 28, marginTop: 6 }}>
          {problemEditableStops.length}
        </div>
      </div>

      <div style={warningStyle}>
        <strong>Pronti</strong>
        <div style={{ fontSize: 28, marginTop: 6 }}>
          {readyEditableStops.length}
        </div>
      </div>

      <div style={warningStyle}>
        <strong>Mancanti</strong>
        <div style={{ fontSize: 28, marginTop: 6 }}>
          {missingStopNumbers.length}
        </div>
      </div>
    </div>

    {missingStopNumbers.length > 0 ? (
      <div style={warningStyle}>
        Numeri stop mancanti nella sequenza: {missingStopNumbers.join(", ")}
      </div>
    ) : null}

    {problemEditableStops.length > 0 ? (
      <div style={{ marginTop: 18 }}>
        <h4 style={{ margin: "0 0 12px", color: "#0f172a" }}>
          Correggi solo questi stop
        </h4>

        <div style={{ display: "grid", gap: 12 }}>
          {problemEditableStops.map((stop) => {
            const warning = suspiciousStops.find(
              (item) => item.originalPosition === stop.originalPosition,
            );

            return (
              <div
                key={stop.originalPosition}
                style={{
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(245,158,11,0.35)",
                  background: "#fff7ed",
                }}
              >
                <strong style={{ color: "#9a3412" }}>
                  STOP #{stop.originalPosition}
                </strong>

                {warning ? (
                  <p
                    style={{
                      margin: "6px 0 10px",
                      fontSize: 13,
                      color: "#92400e",
                      fontWeight: 700,
                    }}
                  >
                    {warning.reasons.join(", ")}
                  </p>
                ) : null}

                <input
                  value={stop.address}
                  onChange={(event) =>
                    setEditableStops((current) =>
                      updateEditableStopAddress(
                        current,
                        stop.originalPosition,
                        event.target.value,
                      ),
                    )
                  }
                  style={{
                    ...ui.form.input,
                    width: "100%",
                    background: "#ffffff",
                    color: "#0f172a",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div style={{ ...warningStyle, background: "rgba(34,197,94,0.12)" }}>
        Tutti gli stop letti sembrano pronti. Puoi importare.
      </div>
    )}

    <details style={{ marginTop: 18 }}>
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        Stop pronti compressi ({readyEditableStops.length})
      </summary>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {readyEditableStops.slice(0, 40).map((stop) => (
          <div
            key={stop.originalPosition}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              fontWeight: 800,
            }}
          >
            <span>#{stop.originalPosition}</span>
            <span>{stop.address}</span>
          </div>
        ))}

        {readyEditableStops.length > 40 ? (
          <p style={mutedTextStyle}>
            + altri {readyEditableStops.length - 40} stop pronti nascosti.
          </p>
        ) : null}
      </div>
    </details>

    <form action={addScreenshotOcrRouteProStops} style={formStyle}>
      <input type="hidden" name="route_id" value={routeId} />
      <input type="hidden" name="ocr_addresses" value={importText} />

      <button
        type="submit"
        style={{
          ...routeProUi.primaryButton,
          minHeight: 52,
          width: "100%",
          background: "#ff7a00",
          borderColor: "#ff7a00",
          color: "#ffffff",
        }}
      >
        Importa rotta corretta
      </button>
    </form>
  </div>
) : null}

          
    </div>
  );
}