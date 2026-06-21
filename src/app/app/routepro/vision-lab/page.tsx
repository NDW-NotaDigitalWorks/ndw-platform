"use client";

import { useState } from "react";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

type AiVisionResponse = {
  ok: boolean;
  text?: string;
  error?: string;
  message?: string;
};

export default function RouteProVisionLabPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleTest() {
    if (files.length === 0) {
      setError("Seleziona almeno uno screenshot Amazon Flex.");
      return;
    }

    setIsProcessing(true);
    setResult("");
    setError("");

    const formData = new FormData();

    for (const file of files) {
      formData.append("screenshot_file", file);
    }

    try {
      const response = await fetch("/api/routepro/ai-vision", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json()) as AiVisionResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.message ?? json.error ?? "Errore AI Vision.");
      }

      setResult(json.text ?? "");
    } catch (error) {
      console.error("RoutePro Vision Lab error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Errore durante il test AI Vision.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section style={routeProUi.shell}>
      <div style={routeProUi.hero}>
        <p
          style={{
            margin: 0,
            color: "#ff8a00",
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          RoutePro Vision Lab
        </p>

        <h1 style={routeProUi.heroTitle}>RoutePro AI Vision</h1>

        <p style={routeProUi.heroSubtitle}>
          Laboratorio interno per verificare il motore AI Vision con batch da 5
          screenshot, merge automatico, normalizzazione e protezione zero stop
          persi.
        </p>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <label style={ui.form.label}>
          Screenshot Amazon Flex
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={ui.form.input}
            disabled={isProcessing}
            onChange={(event) => {
              setFiles(Array.from(event.target.files ?? []));
              setResult("");
              setError("");
            }}
          />
        </label>

        {files.length > 0 ? (
          <p
            style={{
              margin: "12px 0 0",
              color: "#cbd5e1",
              fontWeight: 800,
            }}
          >
            Screenshot selezionati: {files.length}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleTest}
          disabled={isProcessing || files.length === 0}
          style={{
            ...routeProUi.primaryButton,
            marginTop: 18,
            opacity: isProcessing || files.length === 0 ? 0.65 : 1,
            cursor:
              isProcessing || files.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing
            ? "Analisi AI Vision in corso..."
            : "Test AI Vision multi screenshot"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            ...ui.card.base,
            marginTop: 18,
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div style={{ ...ui.card.base, marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>Risposta AI Vision</h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#e5e7eb",
              background: "rgba(15,23,42,0.88)",
              padding: 16,
              borderRadius: 16,
              overflowX: "auto",
            }}
          >
            {result}
          </pre>
        </div>
      ) : null}
    </section>
  );
}