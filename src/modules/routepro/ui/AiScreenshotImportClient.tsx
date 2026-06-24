"use client";

import { useMemo, useState } from "react";
import type {
  RouteProAiExtractedStop,
  RouteProAiImportPreview,
} from "@/modules/routepro/types/routepro.ai-import.types";

const CLIENT_UPLOAD_BATCH_SIZE = 10;

function chunkFiles(files: File[], size: number): File[][] {
  const chunks: File[][] = [];

  for (let index = 0; index < files.length; index += size) {
    chunks.push(files.slice(index, index + size));
  }

  return chunks;
}

function mergeStopsByOriginalNumber(
  stops: RouteProAiExtractedStop[],
): RouteProAiExtractedStop[] {
  const byNumber = new Map<number, RouteProAiExtractedStop>();

  for (const stop of stops) {
    const existing = byNumber.get(stop.originalStopNumber);

    if (!existing) {
      byNumber.set(stop.originalStopNumber, stop);
      continue;
    }

    if (existing.confidence !== "high" && stop.confidence === "high") {
      byNumber.set(stop.originalStopNumber, stop);
    }
  }

  return Array.from(byNumber.values()).sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );
}

function rebuildCombinedPreview(
  previews: RouteProAiImportPreview[],
): RouteProAiImportPreview {
  const firstPreview = previews[0];

  const stops = mergeStopsByOriginalNumber(
    previews.flatMap((preview) => preview.stops),
  );

  const highConfidence = stops.filter((stop) => stop.confidence === "high").length;
  const mediumConfidence = stops.filter((stop) => stop.confidence === "medium").length;
  const lowConfidence = stops.filter((stop) => stop.confidence === "low").length;
  const needsReview = stops.filter(
    (stop) => stop.confidence === "needs_review",
  ).length;
  const placeholders = stops.filter((stop) => stop.isPlaceholder).length;
  const missing = placeholders;

  const blockingReason =
    placeholders > 0 || missing > 0
      ? "Correggi gli stop mancanti prima di creare la rotta."
      : null;

  return {
    ...firstPreview,
    importId: previews.map((preview) => preview.importId).join("__"),
    stops,
    batchSummaries: previews.flatMap((preview) => preview.batchSummaries),
    recoveryPlan: firstPreview.recoveryPlan,
    summary: {
      totalFound: stops.length,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      needsReview,
      placeholders,
      missing,
    },
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
  const needsReview = stops.filter(
    (stop) => stop.confidence === "needs_review",
  ).length;
  const placeholders = stops.filter((stop) => stop.isPlaceholder).length;

  const missing = placeholders;

  const blockingReason =
    placeholders > 0 || missing > 0
      ? "Correggi gli stop mancanti prima di ottimizzare la rotta."
      : null;

  return {
    ...preview,
    stops,
    summary: {
      totalFound: stops.length,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      needsReview,
      placeholders,
      missing,
    },
    canCreateRoute: stops.length > 0 && placeholders === 0 && missing === 0,
    canOptimize: blockingReason === null,
    blockingReason,
  };
}

export function AiScreenshotImportClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<RouteProAiImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = files.length > 0 && !isAnalyzing;

  const filesLabel = useMemo(() => {
    if (files.length === 0) return "Nessun file selezionato";
    if (files.length === 1) return "1 screenshot selezionato";
    return `${files.length} screenshot selezionati`;
  }, [files.length]);

  async function handleAnalyze() {
  setError(null);
  setPreview(null);
  setIsAnalyzing(true);

  try {
    const uploadBatches = chunkFiles(files, CLIENT_UPLOAD_BATCH_SIZE);
    const previews: RouteProAiImportPreview[] = [];

    for (let index = 0; index < uploadBatches.length; index += 1) {
      const batch = uploadBatches[index];
      const formData = new FormData();

      for (const file of batch) {
        formData.append("screenshots", file);
      }

      const response = await fetch("/api/routepro/import-ai/analyze", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      let payload: {
        ok?: boolean;
        message?: string;
        preview?: RouteProAiImportPreview;
      };

      try {
        payload = JSON.parse(responseText) as {
          ok?: boolean;
          message?: string;
          preview?: RouteProAiImportPreview;
        };
      } catch {
        throw new Error(
          responseText || "Risposta non valida dal server durante l'analisi AI.",
        );
      }

      if (!response.ok || !payload.ok || !payload.preview) {
        throw new Error(payload.message ?? "Analisi AI non riuscita.");
      }

      previews.push(payload.preview);
    }

    setPreview(rebuildCombinedPreview(previews));
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Errore imprevisto durante l'analisi AI.",
    );
  } finally {
    setIsAnalyzing(false);
  }
}

  function updateStopAddress(originalStopNumber: number, addressRaw: string) {
    if (!preview) return;

    const cleanedAddress = addressRaw.trim();

    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) {
        return stop;
      }

      const isStillPlaceholder = cleanedAddress.length === 0;

      return {
        ...stop,
        addressRaw: cleanedAddress,
        isPlaceholder: isStillPlaceholder,
        confidence: isStillPlaceholder ? "needs_review" : "medium",
        needsReviewReason: isStillPlaceholder
          ? "Indirizzo mancante"
          : "Corretto manualmente in preview",
      } satisfies RouteProAiExtractedStop;
    });

    setPreview(rebuildPreviewWithEditedStops(preview, nextStops));
  }

  function updateStopCity(originalStopNumber: number, city: string) {
    if (!preview) return;

    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) {
        return stop;
      }

      return {
        ...stop,
        city: city.trim() || null,
      };
    });

    setPreview(rebuildPreviewWithEditedStops(preview, nextStops));
  }

  function markStopReviewed(originalStopNumber: number) {
    if (!preview) return;

    const nextStops = preview.stops.map((stop) => {
      if (stop.originalStopNumber !== originalStopNumber) {
        return stop;
      }

      const hasAddress = stop.addressRaw.trim().length > 0;

      return {
        ...stop,
        confidence: hasAddress ? "medium" : "needs_review",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  editedStops: preview.stops,
}),
      });

      const responseText = await response.text();
      console.log("CREATE ROUTE RESPONSE", {
  status: response.status,
  responseText,
});

let payload: {
  ok?: boolean;
  message?: string;
  routeId?: string;
};

try {
  payload = JSON.parse(responseText) as {
    ok?: boolean;
    message?: string;
    routeId?: string;
  };
} catch {
  throw new Error(
    responseText || "Risposta non valida durante la creazione rotta.",
  );
}

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Creazione rotta non riuscita.");
      }

      window.location.href = `/app/routepro/routes/${payload.routeId}/review`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante la creazione rotta.",
      );
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">1. Upload Screenshot</h2>
        <p className="mt-2 text-sm text-slate-300">
          Carica tutti gli screenshot della rotta. RoutePro li analizzerà automaticamente in blocchi sicuri per aumentare precisione e stabilità.
        </p>

        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-500 bg-slate-900/70 px-4 py-10 text-center hover:border-cyan-300">
          <span className="text-sm font-semibold text-white">
            Seleziona screenshot
          </span>
          <span className="mt-2 text-xs text-slate-400">
            PNG, JPG, JPEG, WEBP
          </span>
          <input
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={(event) => {
              setFiles(Array.from(event.target.files ?? []));
            }}
          />
        </label>

        <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
          {filesLabel}
        </div>

        <button
          type="button"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAnalyzing ? "Analisi AI in corso..." : "Analizza con AI"}
        </button>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">2. Preview & Review</h2>

        {!preview ? (
          <p className="mt-3 text-sm text-slate-300">
            Dopo l’analisi potrai correggere placeholder, indirizzi e comuni prima
            di creare la rotta.
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric label="Stop trovati" value={preview.summary.totalFound} />
              <Metric label="High" value={preview.summary.highConfidence} />
              <Metric label="Low" value={preview.summary.lowConfidence} />
              <Metric label="Needs review" value={preview.summary.needsReview} />
              <Metric label="Missing" value={preview.summary.missing} />
            </div>

            {preview.batchSummaries.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                <div className="text-sm font-bold text-white">
                  Batch Processing
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  Screenshot analizzati in blocchi da 5.
                </div>
              </div>
            ) : null}

            {preview.blockingReason ? (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
                {preview.blockingReason}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                Nessuno stop mancante rilevato. La rotta può essere creata.
              </div>
            )}

            <div className="max-h-[620px] overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Stop</th>
                    <th className="px-4 py-3">Indirizzo</th>
                    <th className="px-4 py-3">Comune</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.stops.map((stop) => {
                    const needsAttention =
                      stop.isPlaceholder ||
                      stop.confidence === "low" ||
                      stop.confidence === "needs_review";

                    return (
                      <tr
                        key={`${stop.originalStopNumber}-${stop.addressRaw}`}
                        className={
                          needsAttention
                            ? "border-t border-amber-300/30 bg-amber-400/5"
                            : "border-t border-white/10"
                        }
                      >
                        <td className="px-4 py-3 font-bold">
                          {stop.originalStopNumber}
                        </td>
                        <td className="min-w-[260px] px-4 py-3">
                          <input
                            value={
                              stop.isPlaceholder &&
                              stop.addressRaw === "PLACEHOLDER_STOP_MISSING_ADDRESS"
                                ? ""
                                : stop.addressRaw
                            }
                            onChange={(event) =>
                              updateStopAddress(
                                stop.originalStopNumber,
                                event.target.value,
                              )
                            }
                            placeholder="Inserisci indirizzo"
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </td>
                        <td className="min-w-[180px] px-4 py-3">
                          <input
                            value={stop.city ?? ""}
                            onChange={(event) =>
                              updateStopCity(
                                stop.originalStopNumber,
                                event.target.value,
                              )
                            }
                            placeholder="Comune"
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                            {stop.confidence}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => markStopReviewed(stop.originalStopNumber)}
                            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                          >
                            Conferma
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              disabled={!preview.canCreateRoute}
              onClick={handleCreateRoute}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Conferma e crea RoutePro Route
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </div>
  );
}