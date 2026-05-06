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

type ApiSuccessResponse = {
  ok: true;
  parsedStops: ParsedStop[];
  fallbackTexts: string[];
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
  gap: 14,
  marginTop: 18,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
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

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];

  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }

  return chunks;
}

function formatStopsForTextarea(stops: ParsedStop[]): string {
  const unique = new Map<number, ParsedStop>();

  for (const stop of stops) {
    if (!unique.has(stop.originalPosition)) {
      unique.set(stop.originalPosition, stop);
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => a.originalPosition - b.originalPosition)
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const batches = useMemo(() => chunkFiles(files, BATCH_SIZE), [files]);
  const totalBatches = batches.length;
  const progress =
    totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0;

  async function handleProcessScreenshots() {
    if (files.length === 0) {
      setErrorMessage("Seleziona almeno uno screenshot.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPreviewText("");
    setCurrentBatch(0);

    const allStops: ParsedStop[] = [];
    const fallbackTexts: string[] = [];

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

        setCurrentBatch(index + 1);
      }

      const formattedStops = formatStopsForTextarea(allStops);

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
    <div style={{ ...ui.card.base, marginTop: 24 }}>
      <p style={ui.page.eyebrow}>Import principale</p>
      <h2 style={ui.page.sectionTitle}>Importa screenshot automatico</h2>

      <p style={mutedTextStyle}>
        Seleziona tutti gli screenshot insieme. RoutePro li leggerà a blocchi da{" "}
        {BATCH_SIZE}, mostrando il progresso e creando una preview ordinata.
      </p>

      <div style={formStyle}>
        <label style={ui.form.label}>
          Screenshot
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={ui.form.input}
            disabled={isProcessing}
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? []);
              setFiles(selectedFiles);
              setPreviewText("");
              setErrorMessage(null);
              setCurrentBatch(0);
            }}
          />
        </label>

        {files.length > 0 ? (
          <p style={mutedTextStyle}>
            Screenshot selezionati: <strong>{files.length}</strong> · Batch
            previsti: <strong>{totalBatches}</strong>
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleProcessScreenshots}
          disabled={isProcessing || files.length === 0}
          style={{
            ...routeProUi.primaryButton,
            opacity: isProcessing || files.length === 0 ? 0.65 : 1,
            cursor: isProcessing || files.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Lettura screenshot in corso..." : "Leggi screenshot selezionati"}
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
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 999,
                background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
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

      {previewText ? (
        <div style={{ ...ui.card.base, marginTop: 18 }}>
          <h3 style={{ marginTop: 0 }}>Preview OCR pulita</h3>

          <p style={mutedTextStyle}>
            Controlla le righe, elimina eventuali errori e poi conferma l’import.
          </p>

          <form action={addScreenshotOcrRouteProStops} style={formStyle}>
            <input type="hidden" name="route_id" value={routeId} />

            <label style={ui.form.label}>
              Stop da importare
              <textarea
                name="ocr_addresses"
                rows={10}
                defaultValue={previewText}
                style={{
                  ...ui.form.input,
                  resize: "vertical",
                  fontFamily: "monospace",
                }}
              />
            </label>

            <button type="submit" style={routeProUi.primaryButton}>
              Importa stop da screenshot
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}