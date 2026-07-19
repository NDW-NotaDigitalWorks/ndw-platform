"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AiScreenshotImportClient } from "@/modules/routepro/ui/AiScreenshotImportClient";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

const workflowGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const setupCardStyle: React.CSSProperties = {
  ...ui.card.base,
  borderRadius: 28,
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,.35)",
};

const stepBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  marginTop: 18,
};

const fullWidthFieldStyle: React.CSSProperties = {
  minWidth: 0,
};

const textInputStyle: React.CSSProperties = {
  ...ui.form.input,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const compactHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 600,
};

const darkSectionTitleStyle: React.CSSProperties = {
  ...ui.page.sectionTitle,
  marginTop: 14,
  marginBottom: 0,
  color: "#ffffff",
};

const darkFormLabelStyle: React.CSSProperties = {
  ...ui.form.label,
  color: "#dbeafe",
  fontWeight: 800,
};

const importCardStyle: React.CSSProperties = {
  ...ui.card.base,
  borderRadius: 28,
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,.35)",
};

const routeSummaryStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  marginTop: 16,
};

const routeSummaryItemStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 18,
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.08)",
};

const routeSummaryLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color:"#94a3b8",
};

const routeSummaryValueStyle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: 15,
  lineHeight: 1.25,
  fontWeight: 900,
  color:"#ffffff",
};

const importSelectorStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginTop: 18,
  marginBottom: 22,
};

const importTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 16,
  lineHeight: 1.3,
  fontWeight: 900,
};

const importTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 600,
};

function getImportMethodCardStyle(active: boolean): React.CSSProperties {
  return {
    cursor: "pointer",
    borderRadius: 18,
    padding: 18,

    border: active
      ? "2px solid #ff7a00"
      : "1px solid rgba(255,255,255,.08)",

    background: active
      ? "rgba(255,122,0,.12)"
      : "rgba(255,255,255,.04)",

    transition: "all .2s ease",

    display: "grid",
    gap: 6,
  };
}

const alternativeImportPanelStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.045)",
  boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
};

const alternativeImportTextareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 220,
  boxSizing: "border-box",
  marginTop: 14,
  padding: 16,
  resize: "vertical",
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.4)",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 15,
  lineHeight: 1.55,
  fontWeight: 700,
  outline: "none",
};

const alternativeImportButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 54,
  marginTop: 14,
  border: "1px solid #f97316",
  borderRadius: 18,
  background: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(234,88,12,0.24)",
};

const alternativeImportDisabledButtonStyle: React.CSSProperties = {
  ...alternativeImportButtonStyle,
  background: "rgba(148,163,184,0.12)",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#64748b",
  cursor: "not-allowed",
  boxShadow: "none",
};

const alternativeImportErrorStyle: React.CSSProperties = {
  margin: "14px 0 0",
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(248,113,113,0.3)",
  background: "rgba(239,68,68,0.1)",
  color: "#fecaca",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 750,
};

const csvDropZoneStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  gap: 8,
  width: "100%",
  minHeight: 160,
  marginTop: 14,
  padding: 20,
  boxSizing: "border-box",
  borderRadius: 20,
  border: "1px dashed rgba(148,163,184,0.55)",
  background: "rgba(255,255,255,0.04)",
  textAlign: "center",
  cursor: "pointer",
};

const csvFileNameStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 15,
  lineHeight: 1.4,
  fontWeight: 900,
};

const csvFormatStyle: React.CSSProperties = {
  margin: "14px 0 0",
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.2)",
  background: "rgba(59,130,246,0.08)",
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.6,
  fontWeight: 650,
  overflowWrap: "anywhere",
};

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === delimiter && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

function displayValue(value: string, fallback: string): string {
  return value.trim() || fallback;
}

export function RouteProNewRouteWorkflowClient() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [name, setName] = useState("");
  const [routeDate, setRouteDate] = useState(today);
  const [routeProfile, setRouteProfile] = useState("generic");
  const [startAddress, setStartAddress] = useState("");
  const [returnAddress, setReturnAddress] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [importMethod, setImportMethod] = useState<"ai" | "list">("ai");
  const [listAddresses, setListAddresses] = useState("");
  const [isCreatingListRoute, setIsCreatingListRoute] = useState(false);
  const [listImportError, setListImportError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvStops, setCsvStops] = useState<RouteProAiExtractedStop[]>([]);
  const [csvImportError, setCsvImportError] = useState<string | null>(null);
  const [isReadingCsv, setIsReadingCsv] = useState(false);
  const [isCreatingCsvRoute, setIsCreatingCsvRoute] = useState(false);

  const routeDraft = {
    name,
    routeDate,
    routeProfile,
    startAddress,
    returnAddress,
    shiftStartTime,
    shiftEndTime,
    breakMinutes,
  };

  async function createRouteFromStops(
  editedStops: RouteProAiExtractedStop[],
  options: {
    setCreating: (value: boolean) => void;
    setError: (message: string | null) => void;
    emptyMessage: string;
    failureMessage: string;
  },
) {
  if (editedStops.length === 0) {
    options.setError(options.emptyMessage);
    return;
  }

  options.setCreating(true);
  options.setError(null);

  try {
    const response = await fetch("/api/routepro/import-ai/create-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        editedStops,
        name: routeDraft.name,
        routeDate: routeDraft.routeDate,
        routeProfile: routeDraft.routeProfile,
        startAddress: routeDraft.startAddress,
        returnAddress: routeDraft.returnAddress,
        shiftStartTime: routeDraft.shiftStartTime,
        shiftEndTime: routeDraft.shiftEndTime,
        breakMinutes: routeDraft.breakMinutes,
      }),
    });

    const responseText = await response.text();

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
        responseText || "Risposta non valida durante la creazione della rotta.",
      );
    }

    if (!response.ok || !payload.ok || !payload.routeId) {
      throw new Error(payload.message ?? options.failureMessage);
    }

    window.location.href = `/app/routepro/routes/${payload.routeId}/review`;
  } catch (error) {
    options.setError(
      error instanceof Error
        ? error.message
        : "Errore imprevisto durante la creazione della rotta.",
    );
  } finally {
    options.setCreating(false);
  }
}

async function handleCreateListRoute() {
  const addresses = listAddresses
    .split(/\r?\n/)
    .map((address) => address.trim())
    .filter((address) => address.length > 0);

  const editedStops: RouteProAiExtractedStop[] = addresses.map(
    (address, index) => ({
      originalStopNumber: index + 1,
      addressRaw: address,
      city: null,
      confidence: "needs_review",
      isPlaceholder: false,
      needsReviewReason: "Verifica indirizzo inserito",
    }),
  );

  await createRouteFromStops(editedStops, {
    setCreating: setIsCreatingListRoute,
    setError: setListImportError,
    emptyMessage: "Inserisci almeno un indirizzo.",
    failureMessage: "Creazione della rotta non riuscita.",
  });
}

async function handleCsvFile(file: File | null) {
  setCsvFile(file);
  setCsvStops([]);
  setCsvImportError(null);

  if (!file) {
    return;
  }

  if (
    !file.name.toLowerCase().endsWith(".csv") &&
    file.type !== "text/csv"
  ) {
    setCsvFile(null);
    setCsvImportError("Seleziona un file in formato CSV.");
    return;
  }

  setIsReadingCsv(true);

  try {
    const rawText = await file.text();
    const text = rawText.replace(/^\uFEFF/, "");

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error(
        "Il CSV deve contenere una riga di intestazione e almeno un indirizzo.",
      );
    }

    const commaCount = (lines[0].match(/,/g) ?? []).length;
    const semicolonCount = (lines[0].match(/;/g) ?? []).length;
    const delimiter: "," | ";" =
      semicolonCount > commaCount ? ";" : ",";

    const headers = parseCsvLine(lines[0], delimiter).map((header) =>
      header.trim().toLowerCase(),
    );

    const addressIndex = headers.indexOf("address");
    const cityIndex = headers.indexOf("city");
    const provinceIndex = headers.indexOf("province");
    const countryIndex = headers.indexOf("country");
    const postalCodeIndex = headers.indexOf("postal_code");

    if (addressIndex === -1) {
      throw new Error(
        'Nel CSV manca la colonna obbligatoria "address".',
      );
    }

    const parsedStops = lines
      .slice(1)
      .map((line, index): RouteProAiExtractedStop | null => {
        const columns = parseCsvLine(line, delimiter);

        const address = columns[addressIndex]?.trim() ?? "";
        const city =
          cityIndex >= 0 ? columns[cityIndex]?.trim() ?? "" : "";
        const province =
          provinceIndex >= 0
            ? columns[provinceIndex]?.trim() ?? ""
            : "";
        const country =
          countryIndex >= 0
            ? columns[countryIndex]?.trim() ?? ""
            : "";
        const postalCode =
          postalCodeIndex >= 0
            ? columns[postalCodeIndex]?.trim() ?? ""
            : "";

        if (!address) {
          return null;
        }

        const addressRaw = [address, postalCode]
          .filter((value) => value.length > 0)
          .join(", ");

        const location = [city, province, country]
          .filter((value) => value.length > 0)
          .join(", ");

        return {
          originalStopNumber: index + 1,
          addressRaw,
          city: location || null,
          confidence: "needs_review",
          isPlaceholder: false,
          needsReviewReason: "Verifica indirizzo importato da CSV",
        };
      })
      .filter(
        (stop): stop is RouteProAiExtractedStop => stop !== null,
      );

    if (parsedStops.length === 0) {
      throw new Error(
        "Il CSV non contiene indirizzi validi da importare.",
      );
    }

    setCsvStops(parsedStops);
  } catch (error) {
    setCsvStops([]);
    setCsvImportError(
      error instanceof Error
        ? error.message
        : "Non è stato possibile leggere il file CSV.",
    );
  } finally {
    setIsReadingCsv(false);
  }
}

async function handleCreateCsvRoute() {
  await createRouteFromStops(csvStops, {
    setCreating: setIsCreatingCsvRoute,
    setError: setCsvImportError,
    emptyMessage: "Seleziona prima un file CSV valido.",
    failureMessage: "Creazione della rotta da CSV non riuscita.",
  });
}

  return (
    <div style={workflowGridStyle}>
      <div style={setupCardStyle}>
        <span style={stepBadgeStyle}>Step 1 · Turno</span>

        <h2 style={darkSectionTitleStyle}>
          Imposta la rotta
        </h2>

        <p style={compactHintStyle}>
          Inserisci solo le informazioni utili al lavoro del driver: nome, orari,
          partenza, rientro e pausa. RoutePro userà questi dati per ritmo, ETA e riepilogo.
        </p>

        <div style={formGridStyle}>
          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Nome rotta
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Esempio: Milano mattina"
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Data
            <input
              value={routeDate}
              onChange={(event) => setRouteDate(event.target.value)}
              type="date"
              required
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Profilo
            <select
              value={routeProfile}
              onChange={(event) => setRouteProfile(event.target.value)}
              style={textInputStyle}
            >
              <option value="generic">Generico</option>
              <option value="courier">Corriere / multi-stop</option>
              <option value="amazon_flex">Amazon Flex</option>
              <option value="technician">Tecnico / appuntamenti</option>
              <option value="sales">Commerciale / visite clienti</option>
            </select>
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Partenza
            <input
              value={startAddress}
              onChange={(event) => setStartAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Rientro
            <input
              value={returnAddress}
              onChange={(event) => setReturnAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Inizio
            <input
              value={shiftStartTime}
              onChange={(event) => setShiftStartTime(event.target.value)}
              type="time"
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Fine
            <input
              value={shiftEndTime}
              onChange={(event) => setShiftEndTime(event.target.value)}
              type="time"
              style={textInputStyle}
            />
          </label>

          <label style={{ ...darkFormLabelStyle, ...fullWidthFieldStyle }}>
            Pausa
            <input
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(Number(event.target.value))}
              type="number"
              min="0"
              step="5"
              style={textInputStyle}
            />
          </label>
        </div>

        <div style={routeSummaryStyle}>
          <div style={routeSummaryItemStyle}>
            <p style={routeSummaryLabelStyle}>Rotta</p>
            <p style={routeSummaryValueStyle}>
              {displayValue(name, "Nome automatico")}
            </p>
          </div>

          <div style={routeSummaryItemStyle}>
            <p style={routeSummaryLabelStyle}>Data</p>
            <p style={routeSummaryValueStyle}>{routeDate}</p>
          </div>

          <div style={routeSummaryItemStyle}>
            <p style={routeSummaryLabelStyle}>Turno</p>
            <p style={routeSummaryValueStyle}>
              {shiftStartTime || "—"} → {shiftEndTime || "—"}
            </p>
          </div>

          <div style={routeSummaryItemStyle}>
            <p style={routeSummaryLabelStyle}>Pausa</p>
            <p style={routeSummaryValueStyle}>{breakMinutes} min</p>
          </div>
        </div>
      </div>

      <div style={importCardStyle}>
  <span
    style={{
      ...stepBadgeStyle,
      background: "#fff7ed",
      color: "#c2410c",
    }}
  >
    Step 2 · Metodo di importazione
  </span>

  <h2 style={darkSectionTitleStyle}>
    Come vuoi creare la rotta?
  </h2>

  <p style={compactHintStyle}>
    Scegli il metodo di importazione. Tutti utilizzano lo stesso workflow
    RoutePro: Review → Verify → Optimize → Drive.
  </p>

  <div style={importSelectorStyle}>
  <div
    style={getImportMethodCardStyle(importMethod === "ai")}
    onClick={() => setImportMethod("ai")}
  >
    <p style={importTitleStyle}>AI Screenshot</p>

    <p style={importTextStyle}>
      Metodo consigliato. Analizza automaticamente gli screenshot.
    </p>
  </div>

  <div
    style={getImportMethodCardStyle(importMethod === "list")}
    onClick={() => setImportMethod("list")}
  >
    <p style={importTitleStyle}>Indirizzi</p>

    <p style={importTextStyle}>
      Scrivi, incolla oppure importa gli indirizzi da CSV.
    </p>
  </div>
</div>

{importMethod === "ai" && (
  <div style={{ marginTop: 12 }}>
    <AiScreenshotImportClient routeDraft={routeDraft} />
  </div>
)}

{importMethod === "list" && (
  <div style={alternativeImportPanelStyle}>
    <p style={{ ...stepBadgeStyle, margin: 0 }}>
      Inserisci gli indirizzi
    </p>

    <h3 style={darkSectionTitleStyle}>
      Scrivi, incolla oppure importa un file
    </h3>

    <p style={compactHintStyle}>
      Inserisci un indirizzo per riga oppure carica un CSV già pronto.
      RoutePro manterrà l’ordine originale e aprirà direttamente la Review.
    </p>

    <textarea
      value={listAddresses}
      onChange={(event) => {
        setListAddresses(event.target.value);
        setListImportError(null);
      }}
      placeholder={`Via Roma 12, Milano
Via Verdi 8, Monza
Via Manzoni 25, Seregno`}
      style={alternativeImportTextareaStyle}
    />

    <p style={compactHintStyle}>
      {
        listAddresses
          .split(/\r?\n/)
          .map((address) => address.trim())
          .filter((address) => address.length > 0).length
      }{" "}
      stop inseriti
    </p>

    {listImportError ? (
      <div style={alternativeImportErrorStyle}>
        {listImportError}
      </div>
    ) : null}

    <button
      type="button"
      onClick={handleCreateListRoute}
      disabled={
        isCreatingListRoute || listAddresses.trim().length === 0
      }
      style={
        isCreatingListRoute || listAddresses.trim().length === 0
          ? alternativeImportDisabledButtonStyle
          : alternativeImportButtonStyle
      }
    >
      {isCreatingListRoute
        ? "Creazione rotta in corso..."
        : "Crea rotta dagli indirizzi"}
    </button>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 24,
      }}
    >
      <div
        style={{
          height: 1,
          flex: 1,
          background: "rgba(255,255,255,0.12)",
        }}
      />

      <span
        style={{
          color: "#94a3b8",
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        oppure importa
      </span>

      <div
        style={{
          height: 1,
          flex: 1,
          background: "rgba(255,255,255,0.12)",
        }}
      />
    </div>

    <label style={csvDropZoneStyle}>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          void handleCsvFile(event.target.files?.[0] ?? null);
        }}
        style={{ display: "none" }}
      />

      <p style={csvFileNameStyle}>
        {isReadingCsv
          ? "Lettura del CSV..."
          : csvFile
            ? csvFile.name
            : "Seleziona un file CSV"}
      </p>

      <p style={{ ...compactHintStyle, margin: 0 }}>
        Tocca qui per scegliere il file dal dispositivo.
      </p>
    </label>

    <div style={csvFormatStyle}>
      Colonna obbligatoria: <strong>address</strong>.
      Colonne facoltative: <strong>city</strong>,{" "}
      <strong>province</strong>, <strong>postal_code</strong> e{" "}
      <strong>country</strong>.
    </div>

    {csvStops.length > 0 ? (
      <p style={compactHintStyle}>
        {csvStops.length} stop trovati nel file e pronti per
        l’importazione.
      </p>
    ) : null}

    {csvImportError ? (
      <div style={alternativeImportErrorStyle}>
        {csvImportError}
      </div>
    ) : null}

    <button
      type="button"
      onClick={handleCreateCsvRoute}
      disabled={
        isReadingCsv ||
        isCreatingCsvRoute ||
        csvStops.length === 0
      }
      style={
        isReadingCsv ||
        isCreatingCsvRoute ||
        csvStops.length === 0
          ? alternativeImportDisabledButtonStyle
          : alternativeImportButtonStyle
      }
    >
      {isCreatingCsvRoute
        ? "Creazione rotta in corso..."
        : "Crea rotta dal CSV"}
    </button>
  </div>
)}
</div>

<div>
  <Link href="/app/routepro" style={routeProUi.secondaryButton}>
    Torna a RoutePro
  </Link>
</div>
</div>
     );
}