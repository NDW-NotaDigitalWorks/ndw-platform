import Link from "next/link";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: ndwTokens.colors.background,
        color: ndwTokens.colors.textPrimary,
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link
          href="/login"
          style={{
            color: ndwTokens.colors.textSecondary,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          ← Torna al login
        </Link>

        <div
          style={{
            marginTop: 28,
            padding: ndwTokens.spacing["2xl"],
            borderRadius: ndwTokens.radius["2xl"],
            border: `1px solid ${ndwTokens.colors.border}`,
            background: ndwTokens.colors.surface,
            boxShadow: ndwTokens.shadows.md,
          }}
        >
          <p
            style={{
              margin: 0,
              color: ndwTokens.colors.primary,
              fontSize: ndwTokens.typography.sizes.small,
              fontWeight: ndwTokens.typography.weights.black,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Sicurezza account
          </p>

          <h1
            style={{
              margin: "12px 0 0",
              color: ndwTokens.colors.textPrimary,
              fontSize: 38,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: ndwTokens.typography.weights.black,
            }}
          >
            Imposta nuova password
          </h1>

          <p
            style={{
              margin: "14px 0 0",
              color: ndwTokens.colors.textSecondary,
              lineHeight: ndwTokens.typography.lineHeights.normal,
            }}
          >
            Inserisci una nuova password per accedere al tuo workspace NDW.
          </p>

          {params.error ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.danger}`,
                background: ndwTokens.colors.dangerSoft,
                color: "#FCA5A5",
              }}
            >
              Password non aggiornata. Riprova.
            </div>
          ) : null}

          <form
            action="/auth/update-password"
            method="post"
            style={{ marginTop: 24 }}
          >
            <label
              style={{
                display: "block",
                color: ndwTokens.colors.textSecondary,
                fontWeight: ndwTokens.typography.weights.bold,
              }}
            >
              Nuova password

              <input
                type="password"
                name="password"
                required
                minLength={8}
                style={{
                  width: "100%",
                  marginTop: 8,
                  minHeight: 48,
                  padding: "0 14px",
                  borderRadius: ndwTokens.radius.md,
                  border: `1px solid ${ndwTokens.colors.borderStrong}`,
                  background: ndwTokens.colors.surfaceRaised,
                  color: ndwTokens.colors.textPrimary,
                  boxSizing: "border-box",
                }}
              />
            </label>

            <button
              type="submit"
              style={{
                marginTop: 18,
                width: "100%",
                minHeight: 48,
                border: "none",
                borderRadius: ndwTokens.radius.md,
                background: ndwTokens.colors.primary,
                color: "#ffffff",
                fontWeight: ndwTokens.typography.weights.black,
                cursor: "pointer",
              }}
            >
              Aggiorna password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}