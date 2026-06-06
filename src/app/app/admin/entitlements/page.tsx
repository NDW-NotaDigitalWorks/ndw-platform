import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { redirect } from "next/navigation";
import {
  grantManualEntitlementAction,
  revokeManualEntitlementAction,
} from "./actions";

type AdminEntitlementsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    action?: string;
  }>;
};

export default async function AdminEntitlementsPage({
  searchParams,
}: AdminEntitlementsPageProps) {
  const access = await getMyCoreAccessState();
  const params = await searchParams;

  if (access.profile?.role?.trim().toLowerCase() !== "owner") {
    redirect("/app?access-denied=1");
  }

  const modules = getEnabledModules();

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
        Admin
      </p>

      <h1
        style={{
          margin: "14px 0 0",
          color: ndwTokens.colors.textPrimary,
          fontSize: ndwTokens.typography.sizes.pageTitle,
          fontWeight: ndwTokens.typography.weights.black,
        }}
      >
        Entitlements
      </h1>

      <p
        style={{
          margin: "12px 0 0",
          color: ndwTokens.colors.textSecondary,
          fontSize: ndwTokens.typography.sizes.bodyLarge,
        }}
      >
        Attiva o revoca accessi ai moduli tramite email o User ID. Utile per
        gestione manuale e prime vendite Whop.
      </p>

      {params.success ? (
        <div
          style={{
            marginTop: ndwTokens.spacing.xl,
            padding: ndwTokens.spacing.lg,
            borderRadius: ndwTokens.radius.lg,
            border: `1px solid ${ndwTokens.colors.primary}`,
            background: ndwTokens.colors.primarySoft,
            color: "#93C5FD",
            fontWeight: ndwTokens.typography.weights.bold,
          }}
        >
          Operazione completata: {params.success}
        </div>
      ) : null}

      {params.error ? (
  <div
    style={{
      marginTop: ndwTokens.spacing.xl,
      padding: ndwTokens.spacing.lg,
      borderRadius: ndwTokens.radius.lg,
      border: `1px solid ${ndwTokens.colors.danger}`,
      background: ndwTokens.colors.dangerSoft,
      color: "#FCA5A5",
      fontWeight: ndwTokens.typography.weights.bold,
    }}
  >
    {params.error === "no-profile"
      ? "Nessun profilo trovato per questa email. Controlla che l’utente abbia già creato un account NDW."
      : params.error === "missing-user"
        ? "Inserisci almeno una email cliente o uno User ID."
        : "Operazione non riuscita. Controlla i dati e riprova."}
  </div>
) : null}

      <div
        style={{
          marginTop: ndwTokens.spacing["3xl"],
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: ndwTokens.spacing.lg,
        }}
      >
        <form
          action={grantManualEntitlementAction}
          style={{
            padding: ndwTokens.spacing.xl,
            border: `1px solid ${ndwTokens.colors.border}`,
            borderRadius: ndwTokens.radius.xl,
            background: ndwTokens.colors.surfaceRaised,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <h2 style={{ margin: 0, color: ndwTokens.colors.textPrimary }}>
            Attiva accesso
          </h2>

          <p style={{ color: ndwTokens.colors.textMuted }}>
            Usa preferibilmente email cliente. User ID resta come fallback.
          </p>

          <label style={{ display: "block", marginTop: 18 }}>
            Email cliente
            <input
              name="email"
              type="email"
              placeholder="cliente@example.com"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: ndwTokens.colors.surface,
                color: ndwTokens.colors.textPrimary,
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            User ID fallback
            <input
              name="userId"
              placeholder="uuid utente"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: ndwTokens.colors.surface,
                color: ndwTokens.colors.textPrimary,
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            Modulo
            <select
              name="moduleKey"
              required
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
              }}
            >
              {modules.map((module) => (
                <option key={module.key} value={module.key}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            Piano
            <select
              name="planCode"
              required
              defaultValue="pro"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
              }}
            >
              <option value="free">free</option>
              <option value="base">base</option>
              <option value="pro">pro</option>
              <option value="elite">elite</option>
            </select>
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            Provider
            <select
              name="provider"
              required
              defaultValue="whop"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
              }}
            >
              <option value="manual">manual</option>
              <option value="whop">whop</option>
            </select>
          </label>

          <button
            type="submit"
            style={{
              marginTop: 18,
              width: "100%",
              minHeight: 46,
              border: "none",
              borderRadius: ndwTokens.radius.md,
              background: ndwTokens.colors.primary,
              color: "#ffffff",
              fontWeight: ndwTokens.typography.weights.black,
              cursor: "pointer",
            }}
          >
            Attiva accesso
          </button>
        </form>

        <form
          action={revokeManualEntitlementAction}
          style={{
            padding: ndwTokens.spacing.xl,
            border: `1px solid ${ndwTokens.colors.border}`,
            borderRadius: ndwTokens.radius.xl,
            background: ndwTokens.colors.surfaceRaised,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <h2 style={{ margin: 0, color: ndwTokens.colors.textPrimary }}>
            Revoca accesso
          </h2>

          <p style={{ color: ndwTokens.colors.textMuted }}>
            Revoca un modulo tramite email o User ID.
          </p>

          <label style={{ display: "block", marginTop: 18 }}>
            Email cliente
            <input
              name="email"
              type="email"
              placeholder="cliente@example.com"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: ndwTokens.colors.surface,
                color: ndwTokens.colors.textPrimary,
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            User ID fallback
            <input
              name="userId"
              placeholder="uuid utente"
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: ndwTokens.colors.surface,
                color: ndwTokens.colors.textPrimary,
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginTop: 14 }}>
            Modulo
            <select
              name="moduleKey"
              required
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 8,
                padding: "0 12px",
                borderRadius: ndwTokens.radius.md,
              }}
            >
              {modules.map((module) => (
                <option key={module.key} value={module.key}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            style={{
              marginTop: 18,
              width: "100%",
              minHeight: 46,
              borderRadius: ndwTokens.radius.md,
              border: `1px solid ${ndwTokens.colors.borderStrong}`,
              background: "transparent",
              color: ndwTokens.colors.textPrimary,
              fontWeight: ndwTokens.typography.weights.bold,
              cursor: "pointer",
            }}
          >
            Revoca accesso
          </button>
        </form>
      </div>
    </section>
  );
}