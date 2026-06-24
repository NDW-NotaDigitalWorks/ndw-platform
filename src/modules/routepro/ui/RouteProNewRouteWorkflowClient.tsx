"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AiScreenshotImportClient } from "@/modules/routepro/ui/AiScreenshotImportClient";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  marginTop: 20,
};

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
    <div style={{ display: "grid", gap: 24 }}>
      <div style={ui.card.base}>
        <p style={ui.page.eyebrow}>Step 1</p>
        <h2 style={ui.page.sectionTitle}>Imposta la rotta</h2>
        <p style={ui.page.subtitle}>
          Inserisci i dati principali del turno. RoutePro li userà per creare la rotta,
          calcolare ritmo, ETA e riepilogo finale.
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
            Data rotta
            <input
              value={routeDate}
              onChange={(event) => setRouteDate(event.target.value)}
              type="date"
              required
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Profilo rotta
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
            Punto di partenza
            <input
              value={startAddress}
              onChange={(event) => setStartAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Punto di rientro
            <input
              value={returnAddress}
              onChange={(event) => setReturnAddress(event.target.value)}
              type="text"
              placeholder="Deposito, casa, magazzino..."
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Ora inizio
            <input
              value={shiftStartTime}
              onChange={(event) => setShiftStartTime(event.target.value)}
              type="time"
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Ora fine
            <input
              value={shiftEndTime}
              onChange={(event) => setShiftEndTime(event.target.value)}
              type="time"
              style={ui.form.input}
            />
          </label>

          <label style={ui.form.label}>
            Pausa minuti
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
      </div>

      <div style={ui.card.base}>
        <p style={ui.page.eyebrow}>Step 2</p>
        <h2 style={ui.page.sectionTitle}>Importa gli stop</h2>
        <p style={ui.page.subtitle}>
          Carica gli screenshot della tua app di consegna. RoutePro mantiene il numero
          originale, controlla gli stop e ti mostra solo quelli da verificare.
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