"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  RouteProAiExtractedStop,
  RouteProAiImportPreview,
} from "@/modules/routepro/types/routepro.ai-import.types";

const CLIENT_UPLOAD_BATCH_SIZE = 10;

type AiScreenshotImportClientProps = {
  routeDraft?: {
    name?: string;
    routeDate?: string;
    routeProfile?: string;
    startAddress?: string;
    returnAddress?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    breakMinutes?: number;
  };
};

const shellStyle: CSSProperties = { display: "grid", gap: 18 };
const panelStyle: CSSProperties = {
  borderRadius: 32,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  boxShadow: "0 22px 56px rgba(15,23,42,0.10)",
  overflow: "hidden",
};
const heroStyle: CSSProperties = {
  padding: 22,
  color: "#ffffff",
  background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#ea580c 145%)",
};
const bodyStyle: CSSProperties = { display: "grid", gap: 18, padding: 18 };
const cardStyle: CSSProperties = {
  borderRadius: 26,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  padding: 18,
  boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
};
const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 14,
};
const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};
const titleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 24,
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
  fontWeight: 950,
  color: "#0f172a",
};
const hintStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.55,
  color: "#475569",
  fontWeight: 650,
};
const dropZoneStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  minHeight: 190,
  padding: 22,
  borderRadius: 26,
  border: "2px dashed #cbd5e1",
  background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)",
  cursor: "pointer",
  textAlign: "center",
};
const grid2Style: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 12,
};
const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(132px,1fr))",
  gap: 12,
};
const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "auto",
  minWidth: 220,
  height: 50,
  padding: "0 24px",
  border: "1px solid #1e293b",
  borderRadius: 16,
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: "0.03em",
  cursor: "pointer",
  transition: "all .2s ease",
  boxShadow: "0 8px 20px rgba(15,23,42,.15)",
};

const disabledButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#e2e8f0",
  border: "1px solid #cbd5e1",
  color: "#94a3b8",
  boxShadow: "none",
  cursor: "not-allowed",
};
const createButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 66,
  border: 0,
  borderRadius: 24,
  background: "linear-gradient(135deg,#020617 0%,#1e293b 100%)",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  cursor: "pointer",
  boxShadow: "0 18px 42px rgba(15,23,42,0.24)",
};
const disabledCreateButtonStyle: CSSProperties = {
  ...createButtonStyle,
  background: "#cbd5e1",
  color: "#64748b",
  boxShadow: "none",
  cursor: "not-allowed",
};
const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 18,
  background: "#ffffff",
  color: "#0f172a",
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 800,
  outline: "none",
};

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];
  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }
  return chunks;
}

function mergeStopsByOriginalNumber(stops: RouteProAiExtractedStop[]) {
  const byNumber = new Map<number, RouteProAiExtractedStop>();
  for (const stop of stops) {
    const existing = byNumber.get(stop.originalStopNumber);
    if (!existing || (existing.confidence !== "high" && stop.confidence === "high")) {
      byNumber.set(stop.originalStopNumber, stop);
    }
  }
  return Array.from(byNumber.values()).sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );
}

function rebuildCombinedPreview(previews: RouteProAiImportPreview[]): RouteProAiImportPreview {
  const firstPreview = previews[0];
  const stops = mergeStopsByOriginalNumber(previews.flatMap((preview) => preview.stops));
  const highConfidence = stops.filter((stop) => stop.confidence === "high").length;
  const mediumConfidence = stops.filter((stop) => stop.confidence === "medium").length;
  const lowConfidence = stops.filter((stop) => stop.confidence === "low").length;
  const needsReview = stops.filter((stop) => stop.confidence === "needs_review").length;
  const placeholders = stops.filter((stop) => stop.isPlaceholder).length;
  const missing = placeholders;
  const blockingReason = placeholders > 0 || missing > 0
    ? "Correggi gli stop mancanti prima di creare la rotta."
    : null;

  return {
    ...firstPreview,
    importId: previews.map((preview) => preview.importId).join("__"),
    stops,
    batchSummaries: previews.flatMap((preview) => preview.batchSummaries),
    recoveryPlan: firstPreview.recoveryPlan,
    summary: { totalFound: stops.length, highConfidence, mediumConfidence, lowConfidence, needsReview, placeholders, missing },
    canCreateRoute: stops.length > 0 && placeholders === 0 && missing === 0,
    canOptimize: blockingReason === null,
    blockingReason,
  };
}

function rebuildPreviewWithEditedStops(
  preview: RouteProAiImportPreview,
  stops: RouteProAiExtractedStop[],
): RouteProAiImportPreview {
  const highConfidence = stops.filter((stop) => stop.confidence === "high").length;
  const mediumConfidence = stops.filter((stop) => stop.confidence === "medium").length;
  const lowConfidence = stops.filter((stop) => stop.confidence === "low").length;
  const needsReview = stops.filter((stop) => stop.confidence === "needs_review").length;
  const placeholders = stops.filter((stop) => stop.isPlaceholder).length;
  const missing = placeholders;
  const blockingReason = placeholders > 0 || missing > 0
    ? "Correggi gli stop mancanti prima di ottimizzare la rotta."
    : null;

  return {
    ...preview,
    stops,
    summary: { totalFound: stops.length, highConfidence, mediumConfidence, lowConfidence, needsReview, placeholders, missing },
    canCreateRoute: stops.length > 0 && placeholders === 0 && missing === 0,
    canOptimize: blockingReason === null,
    blockingReason,
  };
}

function getStopsToReview(stops: RouteProAiExtractedStop[]) {
  return stops.filter((stop) => stop.isPlaceholder || stop.confidence === "low" || stop.confidence === "needs_review");
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / 1024 / 1024;
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}

export function AiScreenshotImportClient({ routeDraft }: AiScreenshotImportClientProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<RouteProAiImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedBatches, setAnalyzedBatches] = useState(0);

  const canAnalyze = files.length > 0 && !isAnalyzing;
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const uploadBatchesCount = useMemo(
    () => (files.length > 0 ? Math.ceil(files.length / CLIENT_UPLOAD_BATCH_SIZE) : 0),
    [files.length],
  );
  const visibleFiles = files.slice(0, 5);
  const hiddenFilesCount = Math.max(0, files.length - visibleFiles.length);
  const stopsToReview = useMemo(() => (preview ? getStopsToReview(preview.stops) : []), [preview]);
  const autoConfirmedCount = preview ? preview.summary.highConfidence + preview.summary.mediumConfidence : 0;
  const reviewCount = stopsToReview.length;
  const progressPercent = uploadBatchesCount > 0
    ? Math.min(100, Math.round((analyzedBatches / uploadBatchesCount) * 100))
    : 0;

  async function handleAnalyze() {
    setError(null);
    setPreview(null);
    setAnalyzedBatches(0);
    setIsAnalyzing(true);

    try {
      const uploadBatches = chunkFiles(files, CLIENT_UPLOAD_BATCH_SIZE);
      const previews: RouteProAiImportPreview[] = [];

      for (let index = 0; index < uploadBatches.length; index += 1) {
        const batch = uploadBatches[index];
        const formData = new FormData();
        for (const file of batch) formData.append("screenshots", file);

        const response = await fetch("/api/routepro/import-ai/analyze", {
          method: "POST",
          body: formData,
        });
        const responseText = await response.text();
        let payload: { ok?: boolean; message?: string; preview?: RouteProAiImportPreview };

        try {
          payload = JSON.parse(responseText) as { ok?: boolean; message?: string; preview?: RouteProAiImportPreview };
        } catch {
          throw new Error(responseText || "Risposta non valida dal server durante l'analisi AI.");
        }

        if (!response.ok || !payload.ok || !payload.preview) {
          throw new Error(payload.message ?? "Analisi AI non riuscita.");
        }

        previews.push(payload.preview);
        setAnalyzedBatches(index + 1);
      }

      setPreview(rebuildCombinedPreview(previews));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto durante l'analisi AI.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateStopAddress(originalStopNumber: number, addressRaw: string) {
    if (!preview) return;
    const cleanedAddress = addressRaw.trim();
    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) return stop;
      const isStillPlaceholder = cleanedAddress.length === 0;
      return {
        ...stop,
        addressRaw: cleanedAddress,
        isPlaceholder: isStillPlaceholder,
        confidence: "needs_review",
needsReviewReason: isStillPlaceholder
  ? "Indirizzo mancante"
  : "Conferma manualmente la correzione",
      } satisfies RouteProAiExtractedStop;
    });
    setPreview(rebuildPreviewWithEditedStops(preview, nextStops));
  }

  function updateStopCity(originalStopNumber: number, city: string) {
    if (!preview) return;
    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) return stop;
      return { ...stop, city: city.trim() || null };
    });
    setPreview(rebuildPreviewWithEditedStops(preview, nextStops));
  }

  function markStopReviewed(originalStopNumber: number) {
    if (!preview) return;
    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) return stop;
      const hasAddress = stop.addressRaw.trim().length > 0;
      return {
        ...stop,
        confidence: hasAddress ? "high" : "needs_review",
        isPlaceholder: !hasAddress,
        needsReviewReason: hasAddress ? "Confermato manualmente" : "Indirizzo mancante",
      } satisfies RouteProAiExtractedStop;
    });
    setPreview(rebuildPreviewWithEditedStops(preview, nextStops));
  }

  async function handleCreateRoute() {
    if (!preview) return;
    setError(null);

    try {
      const response = await fetch("/api/routepro/import-ai/create-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editedStops: preview.stops,
          name: routeDraft?.name,
          routeDate: routeDraft?.routeDate,
          routeProfile: routeDraft?.routeProfile,
          startAddress: routeDraft?.startAddress,
          returnAddress: routeDraft?.returnAddress,
          shiftStartTime: routeDraft?.shiftStartTime,
          shiftEndTime: routeDraft?.shiftEndTime,
          breakMinutes: routeDraft?.breakMinutes,
        }),
      });

      const responseText = await response.text();
      let payload: { ok?: boolean; message?: string; routeId?: string };

      try {
        payload = JSON.parse(responseText) as { ok?: boolean; message?: string; routeId?: string };
      } catch {
        throw new Error(responseText || "Risposta non valida durante la creazione rotta.");
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Creazione rotta non riuscita.");
      }

      window.location.href = `/app/routepro/routes/${payload.routeId}/review`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto durante la creazione rotta.");
    }
  }

  return (
    <section style={shellStyle}>
      <div style={panelStyle}>
        <div style={heroStyle}>
          <p style={{ ...eyebrowStyle, color: "#fdba74" }}>RoutePro AI Import</p>
          <h3 style={{ margin: "8px 0 0", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.04em", fontWeight: 950 }}>
            Carica, controlla e crea la rotta
          </h3>
          <p style={{ margin: "10px 0 0", maxWidth: 720, color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.6, fontWeight: 650 }}>
            Seleziona gli screenshot della tua app di consegna. RoutePro mantiene il numero originale e mostra solo ciò che richiede attenzione.
          </p>
        </div>

        <div style={bodyStyle}>
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <p style={{ ...eyebrowStyle, color: "#ea580c" }}>Step 2</p>
                <h4 style={titleStyle}>Screenshot rotta</h4>
                <p style={hintStyle}>Carica tutti gli screenshot. La lista resta compatta anche con molti file.</p>
              </div>
              <CounterBadge value={files.length} label="screenshot" />
            </div>

            <label style={dropZoneStyle}>
              <div style={{ display: "grid", placeItems: "center", width: 58, height: 58, borderRadius: 20, background: "#fff7ed", color: "#ea580c", fontSize: 28, fontWeight: 950 }}>+</div>
              <strong style={{ display: "block", marginTop: 14, color: "#0f172a", fontSize: 18, fontWeight: 950 }}>Seleziona screenshot</strong>
              <span style={{ display: "block", marginTop: 6, color: "#64748b", fontSize: 13, lineHeight: 1.5, fontWeight: 700 }}>PNG, JPG, JPEG, WEBP - upload multiplo</span>
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={(event) => {
                  setFiles(Array.from(event.target.files ?? []));
                  setPreview(null);
                  setError(null);
                  setAnalyzedBatches(0);
                }}
              />
            </label>

            <div style={{ ...grid2Style, marginTop: 14 }}>
              <UploadSummary
                files={files}
                visibleFiles={visibleFiles}
                hiddenFilesCount={hiddenFilesCount}
                totalSize={totalSize}
                uploadBatchesCount={uploadBatchesCount}
              />
              <button type="button" disabled={!canAnalyze} onClick={handleAnalyze} style={canAnalyze ? primaryButtonStyle : disabledButtonStyle}>
                {isAnalyzing ? "Analisi in corso..." : "Analizza con AI"}
              </button>
            </div>
          </div>

          {isAnalyzing ? (
            <div style={cardStyle}>
              <div style={headerRowStyle}>
                <div>
                  <p style={{ ...eyebrowStyle, color: "#2563eb" }}>RoutePro AI</p>
                  <h4 style={titleStyle}>Analisi in corso</h4>
                  <p style={hintStyle}>Lettura screenshot in batch sicuri. Mantieni aperta questa pagina.</p>
                </div>
                <CounterBadge value={`${progressPercent}%`} label="progress" />
              </div>
              <div style={{ height: 14, overflow: "hidden", borderRadius: 999, background: "#dbeafe" }}>
                <div style={{ width: `${Math.max(8, progressPercent)}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb 0%,#38bdf8 100%)", transition: "width 250ms ease" }} />
              </div>
              <p style={{ ...hintStyle, marginTop: 10 }}>Batch {analyzedBatches} / {uploadBatchesCount}</p>
            </div>
          ) : null}

          {error ? <MessageBox tone="danger" title="Errore">{error}</MessageBox> : null}

          <ResultPanel
            preview={preview}
            autoConfirmedCount={autoConfirmedCount}
            reviewCount={reviewCount}
            stopsToReview={stopsToReview}
            onUpdateAddress={updateStopAddress}
            onUpdateCity={updateStopCity}
            onConfirmStop={markStopReviewed}
            onCreateRoute={handleCreateRoute}
          />
        </div>
      </div>
    </section>
  );
}

function UploadSummary({
  files,
  visibleFiles,
  hiddenFilesCount,
  totalSize,
  uploadBatchesCount,
}: {
  files: File[];
  visibleFiles: File[];
  hiddenFilesCount: number;
  totalSize: number;
  uploadBatchesCount: number;
}) {
  return (
    <div style={{ borderRadius: 22, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(92px,1fr))", gap: 10 }}>
        <MiniStat label="File" value={String(files.length)} />
        <MiniStat label="Peso" value={formatBytes(totalSize)} />
        <MiniStat label="Batch" value={String(uploadBatchesCount)} />
      </div>

      {visibleFiles.length > 0 ? (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {visibleFiles.map((file) => (
            <div key={`${file.name}-${file.size}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0", padding: "9px 10px", color: "#334155", fontSize: 12, fontWeight: 800 }}>
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              <span style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{formatBytes(file.size)}</span>
            </div>
          ))}
          {hiddenFilesCount > 0 ? (
            <div style={{ borderRadius: 14, background: "#ffffff", border: "1px dashed #cbd5e1", padding: "9px 10px", color: "#64748b", fontSize: 12, fontWeight: 950 }}>
              +{hiddenFilesCount} altri screenshot
            </div>
          ) : null}
        </div>
      ) : (
        <p style={{ ...hintStyle, marginTop: 12 }}>Nessun file selezionato. Quando carichi gli screenshot li vedrai qui.</p>
      )}
    </div>
  );
}

function ResultPanel({
  preview,
  autoConfirmedCount,
  reviewCount,
  stopsToReview,
  onUpdateAddress,
  onUpdateCity,
  onConfirmStop,
  onCreateRoute,
}: {
  preview: RouteProAiImportPreview | null;
  autoConfirmedCount: number;
  reviewCount: number;
  stopsToReview: RouteProAiExtractedStop[];
  onUpdateAddress: (originalStopNumber: number, addressRaw: string) => void;
  onUpdateCity: (originalStopNumber: number, city: string) => void;
  onConfirmStop: (originalStopNumber: number) => void;
  onCreateRoute: () => void;
}) {
  return (
    <div style={cardStyle}>
      <div style={headerRowStyle}>
        <div>
          <p style={{ ...eyebrowStyle, color: "#2563eb" }}>Controllo rapido</p>
          <h4 style={titleStyle}>Risultato AI</h4>
          <p style={hintStyle}>Gli stop confermati non richiedono azioni manuali.</p>
        </div>
        {preview ? <Pill tone={reviewCount === 0 ? "success" : "warning"}>{reviewCount === 0 ? "Rotta pronta" : "Da controllare"}</Pill> : null}
      </div>

      {!preview ? (
        <MessageBox tone="idle" title="In attesa dell'analisi">
          Dopo l'analisi vedrai un riepilogo chiaro e solo gli stop che richiedono attenzione.
        </MessageBox>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={metricGridStyle}>
            <Metric label="Stop trovati" value={preview.summary.totalFound} />
            <Metric label="Confermati" value={autoConfirmedCount} />
            <Metric label="Da controllare" value={reviewCount} />
            <Metric label="Mancanti" value={preview.summary.missing} />
          </div>

          {preview.blockingReason ? (
            <MessageBox tone="warning" title="Correzione richiesta">{preview.blockingReason}</MessageBox>
          ) : stopsToReview.length > 0 ? (
            <MessageBox tone="warning" title="Controllo rapido">{stopsToReview.length} stop richiedono verifica. Gli altri sono già confermati automaticamente.</MessageBox>
          ) : (
            <MessageBox tone="success" title="Tutto pronto">Nessuno stop da correggere. La rotta può essere creata.</MessageBox>
          )}

          {stopsToReview.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {stopsToReview.map((stop) => (
                <ReviewStopCard
                  key={`${stop.originalStopNumber}-${stop.addressRaw}`}
                  stop={stop}
                  onUpdateAddress={onUpdateAddress}
                  onUpdateCity={onUpdateCity}
                  onConfirmStop={onConfirmStop}
                />
              ))}
            </div>
          ) : null}

          <button type="button" disabled={!preview.canCreateRoute} onClick={onCreateRoute} style={preview.canCreateRoute ? createButtonStyle : disabledCreateButtonStyle}>
            Crea rotta RoutePro - {preview.summary.totalFound} stop
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewStopCard({
  stop,
  onUpdateAddress,
  onUpdateCity,
  onConfirmStop,
}: {
  stop: RouteProAiExtractedStop;
  onUpdateAddress: (originalStopNumber: number, addressRaw: string) => void;
  onUpdateCity: (originalStopNumber: number, city: string) => void;
  onConfirmStop: (originalStopNumber: number) => void;
}) {
  const initialAddress =
    stop.isPlaceholder && stop.addressRaw === "PLACEHOLDER_STOP_MISSING_ADDRESS"
      ? ""
      : stop.addressRaw;

  const [draftAddress, setDraftAddress] = useState(initialAddress);
  const [draftCity, setDraftCity] = useState(stop.city ?? "");

  return (
    <article style={{ borderRadius: 24, border: "1px solid #fde68a", background: "linear-gradient(180deg,#fffbeb 0%,#ffffff 100%)", padding: 16 }}>
      <div style={headerRowStyle}>
        <div>
          <p style={{ ...eyebrowStyle, color: "#b45309" }}>Stop originale</p>
          <h5 style={{ margin: "5px 0 0", fontSize: 30, lineHeight: 1, fontWeight: 950, color: "#0f172a" }}>#{stop.originalStopNumber}</h5>
        </div>
        <Pill tone="warning">{stop.isPlaceholder ? "mancante" : stop.confidence}</Pill>
      </div>

      <div style={grid2Style}>
        <FieldLabel label="Indirizzo">
          <input
            value={draftAddress}
            onChange={(event) => setDraftAddress(event.target.value)}
            placeholder="Inserisci indirizzo"
            style={inputStyle}
          />
        </FieldLabel>

        <FieldLabel label="Comune">
          <input
            value={draftCity}
            onChange={(event) => setDraftCity(event.target.value)}
            placeholder="Comune"
            style={inputStyle}
          />
        </FieldLabel>
      </div>

      {stop.needsReviewReason ? (
        <div style={{ marginTop: 12 }}>
          <MessageBox tone="warning" title="Motivo">{stop.needsReviewReason}</MessageBox>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          onUpdateAddress(stop.originalStopNumber, draftAddress);
          onUpdateCity(stop.originalStopNumber, draftCity);
          onConfirmStop(stop.originalStopNumber);
        }}
        style={{ ...createButtonStyle, minHeight: 52, marginTop: 14, fontSize: 13 }}
      >
        Conferma stop
      </button>
    </article>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8, color: "#64748b", fontSize: 11, fontWeight: 950, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 16 }}>
      <div style={{ color: "#0f172a", fontSize: 34, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.04em" }}>{value}</div>
      <div style={{ marginTop: 8, color: "#64748b", fontSize: 11, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function CounterBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ minWidth: 86, borderRadius: 22, background: "#0f172a", color: "#ffffff", padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, lineHeight: 1, fontWeight: 950 }}>{value}</div>
      <div style={{ marginTop: 5, fontSize: 10, fontWeight: 900, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", padding: 10 }}>
      <div style={{ color: "#0f172a", fontSize: 15, lineHeight: 1.1, fontWeight: 950 }}>{value}</div>
      <div style={{ marginTop: 5, color: "#64748b", fontSize: 10, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function Pill({ tone, children }: { tone: "idle" | "active" | "success" | "warning" | "danger"; children: ReactNode }) {
  const colors = getToneColors(tone);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: `1px solid ${colors.border}`, background: colors.background, color: colors.text, padding: "8px 11px", fontSize: 11, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function MessageBox({
  tone,
  title,
  children,
}: {
  tone: "idle" | "active" | "success" | "warning" | "danger";
  title: string;
  children: ReactNode;
}) {
  const colors = getToneColors(tone);
  return (
    <div style={{ borderRadius: 22, border: `1px solid ${colors.border}`, background: colors.background, padding: 14 }}>
      <p style={{ margin: 0, color: colors.strong, fontSize: 14, fontWeight: 950 }}>{title}</p>
      <p style={{ margin: "5px 0 0", color: colors.text, fontSize: 13, lineHeight: 1.5, fontWeight: 700 }}>{children}</p>
    </div>
  );
}

function getToneColors(tone: "idle" | "active" | "success" | "warning" | "danger") {
  if (tone === "success") return { background: "#ecfdf5", border: "#bbf7d0", text: "#047857", strong: "#064e3b" };
  if (tone === "warning") return { background: "#fffbeb", border: "#fde68a", text: "#b45309", strong: "#78350f" };
  if (tone === "danger") return { background: "#fef2f2", border: "#fecaca", text: "#b91c1c", strong: "#7f1d1d" };
  if (tone === "active") return { background: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", strong: "#1e3a8a" };
  return { background: "#f8fafc", border: "#e2e8f0", text: "#64748b", strong: "#0f172a" };
}
