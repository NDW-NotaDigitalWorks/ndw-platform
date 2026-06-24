import Link from "next/link";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 24,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#64748b",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  marginTop: 14,
  padding: "8px 12px",
  borderRadius: 999,
  background: "#ecfdf5",
  color: "#047857",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export default function RouteProSettingsPage() {
  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Preferenze operative per driver e corrieri" />

      <p style={ui.page.eyebrow}>Impostazioni</p>
      <h1 style={ui.page.title}>Preferenze Driver</h1>
      <p style={ui.page.subtitle}>
        RoutePro è già configurato da NDW. Non devi inserire API, chiavi tecniche o configurazioni complesse.
      </p>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Configurazione sistema</h2>
        <p style={mutedTextStyle}>
          AI Screenshot Import, geocoding e ottimizzazione sono gestiti da NDW.
          Il driver deve solo caricare gli screenshot, creare la rotta e partire.
        </p>

        <span style={badgeStyle}>API gestite da NDW</span>
      </div>

      <div style={gridStyle}>
        <div style={ui.card.base}>
          <h2 style={ui.page.sectionTitle}>Navigazione</h2>
          <p style={mutedTextStyle}>
            Usa Google Maps o Waze dal Driver Command Center durante la consegna.
          </p>
        </div>

        <div style={ui.card.base}>
          <h2 style={ui.page.sectionTitle}>Numero originale</h2>
          <p style={mutedTextStyle}>
            RoutePro mantiene il numero originale dell’app del corriere per ridurre errori e confusione.
          </p>
        </div>

        <div style={ui.card.base}>
          <h2 style={ui.page.sectionTitle}>Workflow RoutePro</h2>
          <p style={mutedTextStyle}>
            Import AI, verifica minima, ottimizzazione, Driver Mode e riepilogo finale.
          </p>
        </div>
      </div>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <h2 style={ui.page.sectionTitle}>Preferenze avanzate</h2>
        <p style={mutedTextStyle}>
          In una prossima versione potrai personalizzare navigatore preferito, pausa media,
          profilo corriere, lingua e preferenze di raggruppamento.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
          <Link href="/app/routepro" style={routeProUi.primaryButton}>
            Torna a RoutePro
          </Link>

          <Link href="/app/routepro/import-ai" style={routeProUi.secondaryButton}>
            Apri AI Import
          </Link>
        </div>
      </div>
    </section>
  );
}