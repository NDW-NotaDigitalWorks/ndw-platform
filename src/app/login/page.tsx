import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    mode?: string;
    "check-email"?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasError = params.error === "1";
  const checkEmail = params["check-email"] === "1";
  const signupMode = params.mode === "signup";

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
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
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
            Accedi a NDW Core
          </h1>

          <p
            style={{
              margin: "16px 0 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: ndwTokens.typography.sizes.bodyLarge,
              lineHeight: ndwTokens.typography.lineHeights.normal,
            }}
          >
            Inserisci la tua email. Riceverai un magic link per accedere al
            workspace operativo.
          </p>

          {hasError ? (
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
              Accesso non riuscito. Controlla l’email e riprova.
            </div>
          ) : null}

          {checkEmail ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.primary}`,
                background: ndwTokens.colors.primarySoft,
                color: "#93C5FD",
                fontSize: ndwTokens.typography.sizes.body,
              }}
            >
              Magic link inviato. Controlla la tua casella email.
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

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
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

    <label
      style={{
        display: "block",
        marginTop: 14,
        color: ndwTokens.colors.textSecondary,
        fontSize: ndwTokens.typography.sizes.small,
        fontWeight: ndwTokens.typography.weights.bold,
      }}
    >
      Password

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
          fontSize: ndwTokens.typography.sizes.body,
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
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
    }}
  >
    <Link
      href={signupMode ? "/login" : "/login?mode=signup"}
      style={{
        color: ndwTokens.colors.primary,
        textDecoration: "none",
      }}
    >
      {signupMode
        ? "Hai già un account? Accedi"
        : "Non hai un account? Registrati"}
    </Link>

    <Link
      href="/login?magic=1"
      style={{
        color: ndwTokens.colors.textSecondary,
        textDecoration: "none",
      }}
    >
      Usa Magic Link
    </Link>
  </div>
  <form
  action="/auth/forgot-password"
  method="post"
  style={{ marginTop: 18 }}
>
  <label
    style={{
      display: "block",
      color: ndwTokens.colors.textSecondary,
      fontSize: ndwTokens.typography.sizes.small,
      fontWeight: ndwTokens.typography.weights.bold,
    }}
  >
    Password dimenticata?
    <input
      type="email"
      name="email"
      required
      placeholder="Inserisci la tua email"
      style={{
        width: "100%",
        marginTop: 8,
        minHeight: 44,
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
</div>
          )}
        </div>
      </div>
    </main>
  );
}