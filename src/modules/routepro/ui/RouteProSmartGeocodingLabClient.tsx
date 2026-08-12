"use client";

import { useState } from "react";

type RankedCandidate = {
  decision: "accept" | "fallback" | "reference_only" | "reject";
  score: number;
  confidence: number;
  usableAsStopCoordinate: boolean;
  evidence: Array<{
    code: string;
    score: number;
    message: string;
  }>;
  candidate: {
    label: string | null;
    lat: number;
    lng: number;
    confidence: number | null;
    layer: string | null;
    street: string | null;
    houseNumber: string | null;
    locality: string | null;
    city: string | null;
    province: string | null;
  };
};

type LabResult = {
  ok: boolean;
  message?: string;
  result?: {
    providerName: "openrouteservice" | "mapbox";
    canonical: {
      canonicalAddress: string;
      confidence: number;
      providerQueries: string[];
    };
    provider: {
      successfulQuery: string | null;
      totalDurationMs: number;
      totalAttempts: number;
      error: string | null;
      traces: Array<{
        query: string;
        attempt: number;
        status: number | null;
        candidateCount: number;
        durationMs: number;
        message: string | null;
      }>;
    };
    ranking: RankedCandidate[];
    selectedCandidate: {
      decision: string;
      score: number;
      confidence: number;
      usableAsStopCoordinate: boolean;
      candidate: {
        label: string | null;
        lat: number;
        lng: number;
        layer: string | null;
      };
    } | null;
  };
};

export function RouteProSmartGeocodingLabClient() {
  const [provider, setProvider] = useState<"openrouteservice" | "mapbox">("openrouteservice");
  const [address, setAddress] = useState(
    "Via XXIV Maggio 22/E, Verano Brianza",
  );
  const [locality, setLocality] = useState("Verano Brianza");
  const [province, setProvince] = useState("MB");
  const [focusLat, setFocusLat] = useState("45.688");
  const [focusLng, setFocusLng] = useState("9.226");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LabResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runLab() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        "/api/routepro/smart-geocoding-lab",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            address,
            context: {
              dominantLocality: locality || null,
              dominantProvince: province || null,
              countryCode: "IT",
              countryName: "Italia",
            },
            focusPoint: {
              lat: Number(focusLat),
              lng: Number(focusLng),
            },
          }),
        },
      );

      const payload = (await response.json()) as LabResult;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ?? `Errore HTTP ${response.status}`,
        );
      }

      setData(payload);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Test non riuscito.",
      );
    } finally {
      setLoading(false);
    }
  }

  const result = data?.result;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          RoutePro Smart Engine
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">
          Smart Geocoding Lab
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Laboratorio interno: non modifica rotte o stop.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-800">
              Provider
            </span>
            <select
              value={provider}
              onChange={(event) =>
                setProvider(
                  event.target.value === "mapbox"
                    ? "mapbox"
                    : "openrouteservice",
                )
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
            >
              <option value="openrouteservice">OpenRouteService</option>
              <option value="mapbox">Mapbox</option>
            </select>
          </label>
          <div />
          <Field label="Indirizzo" value={address} onChange={setAddress} wide />
          <Field
            label="Località dominante"
            value={locality}
            onChange={setLocality}
          />
          <Field
            label="Provincia dominante"
            value={province}
            onChange={setProvince}
          />
          <Field label="Focus lat" value={focusLat} onChange={setFocusLat} />
          <Field label="Focus lng" value={focusLng} onChange={setFocusLng} />
        </div>

        <button
          type="button"
          onClick={runLab}
          disabled={loading || !address.trim()}
          className="mt-5 min-h-12 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Analisi in corso..." : "Esegui test"}
        </button>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="grid gap-4 sm:grid-cols-5">
            <Metric
              label="Provider"
              value={
                result.providerName === "mapbox"
                  ? "Mapbox"
                  : "ORS"
              }
            />
            <Metric
              label="Confidence indirizzo"
              value={`${result.canonical.confidence}%`}
            />
            <Metric
              label="Candidati valutati"
              value={String(result.ranking.length)}
            />
            <Metric
              label="Tentativi"
              value={String(result.provider.totalAttempts)}
            />
            <Metric
              label="Tempo"
              value={`${result.provider.totalDurationMs} ms`}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Decisione finale
            </h2>

            {result.selectedCandidate ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-900">
                  Candidato accettato
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {result.selectedCandidate.candidate.label ?? "Senza label"}
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Score {result.selectedCandidate.score} ·{" "}
                  {result.selectedCandidate.candidate.lat},{" "}
                  {result.selectedCandidate.candidate.lng}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">
                  Nessun candidato utilizzabile come stop
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Il risultato del provider può essere usato come riferimento,
                  ma non come coordinata affidabile del civico.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Indirizzo canonico
            </h2>
            <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm font-medium">
              {result.canonical.canonicalAddress || "—"}
            </p>

            <h3 className="mt-5 text-sm font-semibold">Query progressive</h3>
            <ol className="mt-2 space-y-2">
              {result.canonical.providerQueries.map((query, index) => (
                <li
                  key={`${query}-${index}`}
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <strong>{index + 1}.</strong> {query}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Ranking candidati
            </h2>

            <div className="mt-4 space-y-4">
              {result.ranking.length === 0 ? (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Nessun candidato: {result.provider.error ?? "nessun dettaglio"}
                </p>
              ) : (
                result.ranking.map((item, index) => (
                  <article
                    key={`${item.candidate.lat}-${item.candidate.lng}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Candidato {index + 1}
                        </p>
                        <h3 className="mt-1 font-semibold text-slate-950">
                          {item.candidate.label ?? "Senza label"}
                        </h3>
                      </div>

                      <div className="flex gap-2">
                        <Badge text={item.decision} />
                        <Badge text={`score ${item.score}`} />
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-700">
                      {item.candidate.lat}, {item.candidate.lng} · layer{" "}
                      {item.candidate.layer ?? "n/d"} · provider confidence{" "}
                      {item.candidate.confidence ?? "n/d"}
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                      <p>
                        <strong>Street provider:</strong>{" "}
                        {item.candidate.street ?? "n/d"}
                      </p>
                      <p className="mt-1">
                        <strong>House number:</strong>{" "}
                        {item.candidate.houseNumber ?? "n/d"}
                      </p>
                      <p className="mt-1">
                        <strong>Locality:</strong>{" "}
                        {item.candidate.locality ?? "n/d"} ·{" "}
                        <strong>City:</strong>{" "}
                        {item.candidate.city ?? "n/d"}
                      </p>
                      <p className="mt-1">
                        <strong>Province:</strong>{" "}
                        {item.candidate.province ?? "n/d"}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {item.evidence.map((evidence, evidenceIndex) => (
                        <div
                          key={`${evidence.code}-${evidenceIndex}`}
                          className="rounded-xl bg-slate-50 p-3 text-sm"
                        >
                          <p className="font-medium text-slate-900">
                            {evidence.score >= 0 ? "+" : ""}
                            {evidence.score} · {evidence.code}
                          </p>
                          <p className="mt-1 text-slate-600">
                            {evidence.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Traccia tentativi
            </h2>
            <div className="mt-4 space-y-2">
              {result.provider.traces.map((trace, index) => (
                <div
                  key={`${trace.query}-${trace.attempt}-${index}`}
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{trace.query}</p>
                  <p className="mt-1 text-slate-600">
                    Tentativo {trace.attempt} · HTTP {trace.status ?? "—"} ·
                    candidati {trace.candidateCount} · {trace.durationMs} ms
                  </p>
                  {trace.message ? (
                    <p className="mt-1 text-red-600">{trace.message}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {text}
    </span>
  );
}