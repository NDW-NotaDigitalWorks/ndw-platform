import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

function formatDate(value: string | null | undefined) {
  if (!value) return "Non disponibile";

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) redirect("/login");
  if (!access.isActiveAccount) redirect("/account-disabled");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activeModuleKeys = await getMyActiveModuleKeys();

  const provider =
    user?.app_metadata?.provider ??
    user?.identities?.[0]?.provider ??
    "email";

  return (
    <section
      style={{
        maxWidth: ndwTokens.layout.pageMaxWidth,
        margin: "0 auto",
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
        Account Center
      </p>

      <h1
        style={{
          margin: "14px 0 0",
          color: ndwTokens.colors.textPrimary,
          fontSize: ndwTokens.typography.sizes.pageTitle,
          fontWeight: ndwTokens.typography.weights.black,
          lineHeight: ndwTokens.typography.lineHeights.tight,
          letterSpacing: "-0.03em",
        }}
      >
        Gestisci il tuo account NDW
      </h1>

      <p
        style={{
          margin: "12px 0 0",
          maxWidth: ndwTokens.layout.narrowMaxWidth,
          color: ndwTokens.colors.textSecondary,
          fontSize: ndwTokens.typography.sizes.bodyLarge,
          lineHeight: ndwTokens.typography.lineHeights.normal,
        }}
      >
        Profilo, sicurezza, accessi e moduli collegati al tuo workspace.
      </p>

      <div
        style={{
          marginTop: ndwTokens.spacing["3xl"],
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: ndwTokens.spacing.lg,
        }}
      >
        <div
          style={{
            padding: ndwTokens.spacing.xl,
            borderRadius: ndwTokens.radius.xl,
            border: `1px solid ${ndwTokens.colors.border}`,
            background: ndwTokens.colors.surfaceRaised,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <h2 style={{ margin: 0, color: ndwTokens.colors.textPrimary }}>
            Profilo
          </h2>

          <p style={{ color: ndwTokens.colors.textMuted, marginTop: 8 }}>
            Identità principale collegata a NDW Core.
          </p>

          <div style={{ marginTop: 18 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              Email
            </p>
            <p
              style={{
                margin: "6px 0 0",
                color: ndwTokens.colors.textPrimary,
                fontWeight: ndwTokens.typography.weights.bold,
                wordBreak: "break-word",
              }}
            >
              {user?.email ?? "Non disponibile"}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              User ID
            </p>
            <p
              style={{
                margin: "6px 0 0",
                color: ndwTokens.colors.textSecondary,
                fontSize: ndwTokens.typography.sizes.small,
                wordBreak: "break-word",
              }}
            >
              {user?.id ?? "Non disponibile"}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              Creato il
            </p>
            <p style={{ margin: "6px 0 0", color: ndwTokens.colors.textPrimary }}>
              {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: ndwTokens.spacing.xl,
            borderRadius: ndwTokens.radius.xl,
            border: `1px solid ${ndwTokens.colors.border}`,
            background: ndwTokens.colors.surfaceRaised,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <h2 style={{ margin: 0, color: ndwTokens.colors.textPrimary }}>
            Sicurezza
          </h2>

          <p style={{ color: ndwTokens.colors.textMuted, marginTop: 8 }}>
            Gestisci accesso e sessione del tuo account.
          </p>

          <div style={{ marginTop: 18 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              Provider login
            </p>
            <p style={{ margin: "6px 0 0", color: ndwTokens.colors.textPrimary }}>
              {provider}
            </p>
          </div>

          <Link
            href="/reset-password"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 18,
              minHeight: 44,
              padding: "0 16px",
              borderRadius: ndwTokens.radius.md,
              border: `1px solid ${ndwTokens.colors.borderStrong}`,
              background: ndwTokens.colors.surfaceSoft,
              color: ndwTokens.colors.textPrimary,
              textDecoration: "none",
              fontWeight: ndwTokens.typography.weights.bold,
            }}
          >
            Cambia password
          </Link>

          <form action="/auth/logout" method="post" style={{ marginTop: 14 }}>
            <button
              type="submit"
              style={{
                minHeight: 44,
                padding: "0 16px",
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: "transparent",
                color: ndwTokens.colors.textSecondary,
                fontWeight: ndwTokens.typography.weights.bold,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </form>
        </div>

        <div
          style={{
            padding: ndwTokens.spacing.xl,
            borderRadius: ndwTokens.radius.xl,
            border: `1px solid ${ndwTokens.colors.border}`,
            background: ndwTokens.colors.surfaceRaised,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <h2 style={{ margin: 0, color: ndwTokens.colors.textPrimary }}>
            Accesso NDW
          </h2>

          <p style={{ color: ndwTokens.colors.textMuted, marginTop: 8 }}>
            Stato account e moduli attualmente disponibili.
          </p>

          <div style={{ marginTop: 18 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              Ruolo
            </p>
            <p style={{ margin: "6px 0 0", color: ndwTokens.colors.textPrimary }}>
              {access.profile?.role ?? "user"}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ color: ndwTokens.colors.textMuted, margin: 0 }}>
              Moduli attivi
            </p>
            <p style={{ margin: "6px 0 0", color: ndwTokens.colors.textPrimary }}>
              {activeModuleKeys.length > 0
                ? activeModuleKeys.join(", ")
                : "Nessun modulo attivo"}
            </p>
          </div>

          <Link
            href="/app/upgrade"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 18,
              minHeight: 44,
              padding: "0 16px",
              borderRadius: ndwTokens.radius.md,
              background: ndwTokens.colors.primary,
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: ndwTokens.typography.weights.black,
            }}
          >
            Gestisci piano
          </Link>
        </div>
      </div>
    </section>
  );
}