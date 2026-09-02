import Image from "next/image";
import Link from "next/link";
import { PasswordField } from "@/components/auth/PasswordField";
import { createClient } from "@/lib/supabase/server";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    mode?: string;
    "signup-email-sent"?: string;
    "reset-email"?: string;
    "password-updated"?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signupMode = params.mode === "signup";
  const signupEmailSent = params["signup-email-sent"] === "1";
  const resetEmail = params["reset-email"] === "1";
  const passwordUpdated = params["password-updated"] === "1";

  const errorMessage =
    params.error === "password-mismatch"
      ? "Le password non coincidono. Controlla e riprova."
      : params.error === "signin"
        ? "Email o password non corrette."
        : params.error === "signup"
          ? "Registrazione non riuscita. L'email potrebbe essere già registrata."
          : params.error === "invalid-signup"
            ? "Inserisci un'email valida e una password di almeno 8 caratteri."
            : params.error === "reset-request"
              ? "Non è stato possibile inviare il link di reset. Riprova più tardi."
              : params.error
                ? "Operazione non riuscita. Controlla i dati e riprova."
                : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top left, ${ndwTokens.colors.primarySoft} 0, transparent 34%), ${ndwTokens.colors.background}`,
        color: ndwTokens.colors.textPrimary,
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: ndwTokens.colors.textSecondary,
            fontWeight: 800,
            textDecoration: "none",
            fontSize: ndwTokens.typography.sizes.body,
          }}
        >
          ← NDW Core
        </Link>

        <div
          style={{
            marginTop: 28,
            padding: ndwTokens.spacing["2xl"],
            borderRadius: ndwTokens.radius["2xl"],
            border: `1px solid ${ndwTokens.colors.border}`,
            background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
            boxShadow: ndwTokens.shadows.md,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: ndwTokens.radius.lg,
              overflow: "hidden",
              border: `1px solid ${ndwTokens.colors.borderStrong}`,
              background: ndwTokens.colors.surfaceRaised,
              marginBottom: 24,
            }}
          >
            <Image
              src="/brand/ndw/icon/ndw-mark.png"
              alt="NDW"
              width={52}
              height={52}
              priority
            />
          </div>

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
            Accesso workspace
          </p>

          <h1
            style={{
              margin: "12px 0 0",
              color: ndwTokens.colors.textPrimary,
              fontSize: 42,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              fontWeight: ndwTokens.typography.weights.black,
            }}
          >
            {signupMode
              ? "Crea il tuo account NDW"
              : "Accedi a NDW Core"}
          </h1>

          <p
            style={{
              margin: "16px 0 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: ndwTokens.typography.sizes.bodyLarge,
              lineHeight: ndwTokens.typography.lineHeights.normal,
            }}
          >
            {signupMode
              ? "Registrati con Google oppure crea un account con email e password."
              : "Accedi con Google oppure usa email e password per entrare nel tuo workspace operativo."}
          </p>

          {errorMessage ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.danger}`,
                background: ndwTokens.colors.dangerSoft,
                color: "#FCA5A5",
                fontSize: ndwTokens.typography.sizes.body,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          {signupEmailSent ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.primary}`,
                background: ndwTokens.colors.primarySoft,
                color: "#93C5FD",
                lineHeight: 1.5,
              }}
            >
              <strong>Controlla la tua email.</strong>
              <div style={{ marginTop: 6 }}>
                Ti abbiamo inviato il link per verificare il tuo account
                NDW. Dopo la conferma potrai accedere a RoutePro.
              </div>
            </div>
          ) : null}

          {resetEmail ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.primary}`,
                background: ndwTokens.colors.primarySoft,
                color: "#93C5FD",
              }}
            >
              Link di reset inviato. Controlla la tua email.
            </div>
          ) : null}

          {passwordUpdated ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.primary}`,
                background: ndwTokens.colors.primarySoft,
                color: "#93C5FD",
              }}
            >
              Password aggiornata. Ora puoi accedere.
            </div>
          ) : null}

          {user ? (
            <div style={{ marginTop: 24 }}>
              <p style={{ color: ndwTokens.colors.textSecondary }}>
                Sei già loggato come:
              </p>

              <p
                style={{
                  color: ndwTokens.colors.textPrimary,
                  fontWeight: ndwTokens.typography.weights.black,
                  wordBreak: "break-word",
                }}
              >
                {user.email}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <Link
                  href="/app"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    padding: "0 16px",
                    borderRadius: ndwTokens.radius.md,
                    background: ndwTokens.colors.primary,
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: ndwTokens.typography.weights.black,
                  }}
                >
                  Vai al workspace
                </Link>

                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    style={{
                      minHeight: 44,
                      padding: "0 16px",
                      borderRadius: ndwTokens.radius.md,
                      border: `1px solid ${ndwTokens.colors.borderStrong}`,
                      background: ndwTokens.colors.surfaceRaised,
                      color: ndwTokens.colors.textPrimary,
                      fontWeight: ndwTokens.typography.weights.bold,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <Link
                href="/auth/google"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  borderRadius: ndwTokens.radius.md,
                  border: `1px solid ${ndwTokens.colors.borderStrong}`,
                  background: ndwTokens.colors.surfaceRaised,
                  color: ndwTokens.colors.textPrimary,
                  fontSize: ndwTokens.typography.sizes.body,
                  fontWeight: ndwTokens.typography.weights.black,
                  textDecoration: "none",
                }}
              >
                Continua con Google
              </Link>

              <div
                style={{
                  margin: "18px 0",
                  color: ndwTokens.colors.textSecondary,
                  textAlign: "center",
                  fontSize: ndwTokens.typography.sizes.small,
                }}
              >
                oppure
              </div>

              <form
                action={signupMode ? "/auth/signup" : "/auth/signin"}
                method="post"
              >
                <label
                  style={{
                    display: "block",
                    color: ndwTokens.colors.textSecondary,
                    fontSize: ndwTokens.typography.sizes.small,
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  Email

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      marginTop: 8,
                      minHeight: 48,
                      padding: "0 14px",
                      borderRadius: ndwTokens.radius.md,
                      border: `1px solid ${ndwTokens.colors.borderStrong}`,
                      background: ndwTokens.colors.surfaceRaised,
                      color: ndwTokens.colors.textPrimary,
                      fontSize: ndwTokens.typography.sizes.body,
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <PasswordField
                  label="Password"
                  name="password"
                />

                {signupMode ? (
                  <PasswordField
                    label="Conferma password"
                    name="confirmPassword"
                  />
                ) : null}

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
                    fontSize: ndwTokens.typography.sizes.body,
                    fontWeight: ndwTokens.typography.weights.black,
                    cursor: "pointer",
                    boxShadow: ndwTokens.shadows.accent,
                  }}
                >
                  {signupMode ? "Crea account" : "Accedi"}
                </button>
              </form>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gap: 12,
                }}
              >
                <Link
                  href={
                    signupMode
                      ? "/login"
                      : "/login?mode=signup"
                  }
                  style={{
                    color: ndwTokens.colors.primary,
                    textDecoration: "none",
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  {signupMode
                    ? "Hai già un account? Accedi"
                    : "Non hai un account? Registrati"}
                </Link>

                {!signupMode ? (
                  <details>
                    <summary
                      style={{
                        cursor: "pointer",
                        color: ndwTokens.colors.textSecondary,
                        fontWeight: ndwTokens.typography.weights.bold,
                      }}
                    >
                      Password dimenticata?
                    </summary>

                    <form
                      action="/auth/forgot-password"
                      method="post"
                      style={{ marginTop: 14 }}
                    >
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Inserisci la tua email"
                        style={{
                          width: "100%",
                          minHeight: 44,
                          padding: "0 14px",
                          borderRadius: ndwTokens.radius.md,
                          border: `1px solid ${ndwTokens.colors.borderStrong}`,
                          background: ndwTokens.colors.surfaceRaised,
                          color: ndwTokens.colors.textPrimary,
                          boxSizing: "border-box",
                        }}
                      />

                      <button
                        type="submit"
                        style={{
                          marginTop: 10,
                          width: "100%",
                          minHeight: 44,
                          borderRadius: ndwTokens.radius.md,
                          border: `1px solid ${ndwTokens.colors.borderStrong}`,
                          background: "transparent",
                          color: ndwTokens.colors.textPrimary,
                          fontWeight: ndwTokens.typography.weights.bold,
                          cursor: "pointer",
                        }}
                      >
                        Ricevi link reset password
                      </button>
                    </form>
                  </details>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}