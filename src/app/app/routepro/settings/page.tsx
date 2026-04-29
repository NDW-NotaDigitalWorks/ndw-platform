import Link from "next/link";
import { saveRouteProOpenRouteServiceKey } from "@/modules/routepro/server/routepro.actions";
import { ui } from "@/styles/ui";

type Props = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 20,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 8,
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

function getErrorMessage(error?: string): string | null {
  if (error === "missing-key") {
    return "Inserisci una API key OpenRouteService.";
  }

  if (error === "save-failed") {
    return "Non siamo riusciti a salvare la chiave. Riprova.";
  }

  return null;
}

export default async function RouteProSettingsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const saved = resolvedSearchParams?.saved === "1";

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>RoutePro</p>
      <h1 style={ui.page.title}>Impostazioni API</h1>
      <p style={ui.page.subtitle}>
        Collega le tue chiavi API per usare geocoding, OCR e funzioni avanzate.
      </p>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
      {saved ? <div style={successStyle}>Chiave salvata correttamente.</div> : null}

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>OpenRouteService</h2>
        <p style={mutedTextStyle}>
          Questa chiave verrà usata per trasformare gli indirizzi in coordinate.
          In V1 RoutePro usa il modello BYOK: ogni utente usa le proprie chiavi.
        </p>

        <form action={saveRouteProOpenRouteServiceKey} style={formStyle}>
          <label style={ui.form.label}>
            API Key OpenRouteService
            <input
              name="openrouteservice_key"
              type="password"
              placeholder="Incolla qui la tua API key"
              style={ui.form.input}
            />
          </label>

          <div style={actionsStyle}>
            <button type="submit" style={ui.button.primary}>
              Salva chiave
            </button>

            <Link href="/app/routepro" style={ui.button.secondary}>
              Torna a RoutePro
            </Link>
          </div>
        </form>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>OCR screenshot</h2>
        <p style={mutedTextStyle}>
          La chiave OCR verrà aggiunta in un blocco successivo. Per ora
          prepariamo prima il geocoding.
        </p>
      </div>
    </section>
  );
}