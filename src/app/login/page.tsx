import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { theme } from "@/styles/theme";
import { ui } from "@/styles/ui";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        padding: "72px 24px",
        color: theme.colors.text,
      }}
    >
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: theme.colors.primary,
            fontWeight: 800,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← NDW Core
        </Link>

        <div style={{ marginTop: 28, ...ui.card.base }}>
          <p style={ui.page.eyebrow}>Accesso</p>

          <h1 style={ui.page.title}>Accedi a NDW Core</h1>

          <p style={ui.page.subtitle}>
            Inserisci la tua email. Riceverai un magic link per accedere al
            workspace.
          </p>

          {hasError ? (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: 14,
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
                borderRadius: 12,
                border: "1px solid #bfdbfe",
                background: theme.colors.primarySoft,
                color: theme.colors.primaryHover,
                fontSize: 14,
              }}
            >
              Magic link inviato. Controlla la tua casella email.
            </div>
          ) : null}

          {user ? (
            <div style={{ marginTop: 24 }}>
              <p style={{ color: theme.colors.textSecondary }}>
                Sei già loggato come:
              </p>

              <p style={{ fontWeight: 800 }}>{user.email}</p>

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <Link href="/app" style={ui.button.primary}>
                  Vai al workspace
                </Link>

                <form action="/auth/logout" method="post">
                  <button type="submit" style={ui.button.secondary}>
                    Logout
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form action="/auth/login" method="post" style={{ marginTop: 24 }}>
              <label style={ui.form.label}>
                Email
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  style={ui.form.input}
                />
              </label>

              <button
                type="submit"
                style={{
                  marginTop: 18,
                  width: "100%",
                  ...ui.button.primary,
                }}
              >
                Invia magic link
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}