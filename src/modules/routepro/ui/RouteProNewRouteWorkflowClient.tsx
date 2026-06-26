"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AiScreenshotImportClient } from "@/modules/routepro/ui/AiScreenshotImportClient";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

const workflowGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const setupCardStyle: React.CSSProperties = {
  ...ui.card.base,
  borderRadius: 28,
  border: "1px solid rgba(59,130,246,0.18)",
  boxShadow: "0 18px 46px rgba(15,23,42,0.08)",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  marginTop: 18,
};

const compactHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 600,
};

const importCardStyle: React.CSSProperties = {
  ...ui.card.base,
  borderRadius: 28,
  border: "1px solid rgba(255,122,0,0.22)",
  boxShadow: "0 20px 52px rgba(15,23,42,0.10)",
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
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const routeSummaryLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#64748b",
};

const routeSummaryValueStyle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: 15,
  lineHeight: 1.25,
  fontWeight: 900,
  color: "#0f172a",
};

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

  return (
    <div style={workflowGridStyle}>
      <div style={setupCardStyle}>
        <span style={stepBadgeStyle}>Step 1 · Turno</span>

        <h2 style={{ ...ui.page.sectionTitle, marginTop: 14 }}>
          Imposta la rotta
        </h2>

        <p style={compactHintStyle}>
          Inserisci solo le informazioni utili al lavoro del driver: nome, orari,
          partenza, rientro e pausa. RoutePro userà questi dati per ritmo, ETA e riepilogo.
        </p>

        <div style={formGridStyle}>
          <label style={ui.form.label}>
            Nome rotta
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Esempio: Milano mattina"
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Data
            <input
              value={routeDate}
              onChange={(event) => setRouteDate(event.target.value)}
              type="date"
              required
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Profilo
            <select
              value={routeProfile}
              onChange={(event) => setRouteProfile(event.target.value)}
              style={ui.form.input}
            >
              <option value="generic">Generico</option>
              <option value="courier">Corriere / multi-stop</option>
              <option value="amazon_flex">Amazon Flex</option>
              <option value="technician">Tecnico / appuntamenti</option>
              <option value="sales">Commerciale / visite clienti</option>
            </select>
          </label>

          <label style={ui.form.label}>
            Partenza
            <input
              value={startAddress}
              onChange={(event) => setStartAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Rientro
            <input
              value={returnAddress}
              onChange={(event) => setReturnAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Inizio
            <input
              value={shiftStartTime}
              onChange={(event) => setShiftStartTime(event.target.value)}
              type="time"
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Fine
            <input
              value={shiftEndTime}
              onChange={(event) => setShiftEndTime(event.target.value)}
              type="time"
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Pausa
            <input
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(Number(event.target.value))}
              type="number"
              min="0"
              step="5"
              style={ui.form.input}
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
          Step 2 · Import AI
        </span>

        <h2 style={{ ...ui.page.sectionTitle, marginTop: 14 }}>
          Importa gli stop
        </h2>

        <p style={compactHintStyle}>
          Carica gli screenshot della tua app di consegna. RoutePro mantiene il
          numero originale, normalizza gli stop e ti mostra solo ciò che va controllato.
        </p>

        <div style={{ marginTop: 20 }}>
          <AiScreenshotImportClient routeDraft={routeDraft} />
        </div>
      </div>

      <div>
        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Torna a RoutePro
        </Link>
      </div>
    </div>
  );
}