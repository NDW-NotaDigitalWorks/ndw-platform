import Link from "next/link";
import { theme } from "@/styles/theme";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: theme.colors.background,
  color: theme.colors.text,
  padding: "72px 24px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1040,
  margin: "0 auto",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: theme.colors.primary,
};

const titleStyle: React.CSSProperties = {
  margin: "16px 0 0",
  maxWidth: 760,
  fontSize: 56,
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
  color: theme.colors.text,
};

const subtitleStyle: React.CSSProperties = {
  margin: "22px 0 0",
  maxWidth: 640,
  fontSize: 18,
  lineHeight: 1.7,
  color: theme.colors.textMuted,
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: 12,
  background: theme.colors.primary,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: 12,
  background: theme.colors.card,
  color: theme.colors.text,
  border: `1px solid ${theme.colors.border}`,
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
};

const cardStyle: React.CSSProperties = {
  marginTop: 56,
  padding: 28,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: 24,
  background: theme.colors.card,
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.06)",
};

export default function HomePage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>NDW Core</p>

        <h1 style={titleStyle}>One workspace for business modules.</h1>

        <p style={subtitleStyle}>
          NDW Core è la piattaforma centrale di Nota Digital Works: moduli,
          accessi, strumenti operativi e workspace per micro-business,
          freelance e operatori digitali.
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login" style={primaryLinkStyle}>
            Accedi
          </Link>

          <Link href="/app" style={secondaryLinkStyle}>
            Apri workspace
          </Link>
        </div>

        <div style={cardStyle}>
          <p style={{ margin: 0, color: theme.colors.textMuted, lineHeight: 1.7 }}>
            Piattaforma modulare in fase di lancio. I moduli disponibili saranno
            accessibili in base al piano e agli entitlement attivi sul tuo account.
          </p>
        </div>
      </div>
    </main>
  );
}