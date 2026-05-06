import Link from "next/link";
import {
  saveRouteProGoogleVisionKey,
  saveRouteProOpenRouteServiceKey,
} from "@/modules/routepro/server/routepro.actions";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

type Props = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    visionSaved?: string;
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
  marginTop: 12,
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

  if (error === "missing-vision-key") {
    return "Inserisci una API key Google Vision.";
  }

  if (error === "vision-save-failed") {
    return "Non siamo riusciti a salvare la chiave OCR.";
  }

  return null;
}

export default async function RouteProSettingsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const saved = resolvedSearchParams?.saved === "1";
  const visionSaved = resolvedSearchParams?.visionSaved === "1";

  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Configura le API per sbloccare tutte le funzionalità" />

      <p style={ui.page.eyebrow}>Impostazioni</p>
      <h1 style={ui.page.title}>API & Integrazioni</h1>
      <p style={ui.page.subtitle}>
        Collega le tue chiavi per attivare geocoding, OCR e automazioni avanzate.
      </p>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {saved ? (
        <div style={successStyle}>
          Chiave OpenRouteService salvata correttamente.
        </div>
      ) : null}

      {visionSaved ? (
        <div style={successStyle}>
          Chiave Google Vision salvata correttamente.
        </div>
      ) : null}

      {/* OpenRouteService */}
      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Geocoding (OpenRouteService)</h2>

        <p style={mutedTextStyle}>
          Usata per trasformare indirizzi in coordinate. RoutePro usa modello BYOK:
          la chiave è tua, i limiti sono tuoi.
        </p>

        <form action={saveRouteProOpenRouteServiceKey} style={formStyle}>
          <label style={ui.form.label}>
            API Key
            <input
              name="openrouteservice_key"
              type="password"
              placeholder="Incolla qui la tua API key"
              style={ui.form.input}
            />
          </label>

          <div style={actionsStyle}>
            <button type="submit" style={routeProUi.primaryButton}>
              Salva chiave
            </button>

            <Link href="/app/routepro" style={routeProUi.secondaryButton}>
              Torna a RoutePro
            </Link>
          </div>
        </form>
      </div>

      {/* Google Vision */}
      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>OCR Screenshot (Google Vision)</h2>

        <p style={mutedTextStyle}>
          Permette di leggere automaticamente screenshot Amazon Flex e ricostruire
          la lista stop.
        </p>

        <form action={saveRouteProGoogleVisionKey} style={formStyle}>
          <label style={ui.form.label}>
            API Key
            <input
              name="google_vision_key"
              type="password"
              placeholder="Incolla qui la tua API key"
              style={ui.form.input}
            />
          </label>

          <div style={actionsStyle}>
            <button type="submit" style={routeProUi.primaryButton}>
              Salva chiave OCR
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}