import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

type EntitlementRow = {
  user_id: string;
  module_key: string;
  plan_code: string | null;
  provider: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminCustomersPage() {
  const access = await getMyCoreAccessState();

  if (access.profile?.role?.trim().toLowerCase() !== "owner") {
    redirect("/app?access-denied=1");
  }

  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,email,role,is_active")
    .order("email", { ascending: true });

  const { data: entitlements } = await supabase
    .from("module_entitlements")
    .select("user_id,module_key,plan_code,provider,is_active,updated_at")
    .order("updated_at", { ascending: false });

  const rows = (profiles ?? []).map((profile: ProfileRow) => {
    const userEntitlements = (entitlements ?? []).filter(
      (entitlement: EntitlementRow) => entitlement.user_id === profile.id,
    );

    const activeEntitlements = userEntitlements.filter(
      (entitlement: EntitlementRow) => entitlement.is_active,
    );

    return {
      profile,
      entitlements: userEntitlements,
      activeEntitlements,
    };
  });

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
        Customer Console
      </h1>

      <p
        style={{
          margin: "12px 0 0",
          color: ndwTokens.colors.textSecondary,
          fontSize: ndwTokens.typography.sizes.bodyLarge,
        }}
      >
        Vista operativa clienti, account, piani e moduli attivi.
      </p>

      <div style={{ marginTop: ndwTokens.spacing.xl }}>
        <Link
          href="/app/admin/entitlements"
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
          Gestisci entitlements
        </Link>
      </div>

      <div
        style={{
          marginTop: ndwTokens.spacing["3xl"],
          display: "grid",
          gap: ndwTokens.spacing.lg,
        }}
      >
        {rows.map(({ profile, activeEntitlements, entitlements }) => (
          <div
            key={profile.id}
            style={{
              padding: ndwTokens.spacing.xl,
              borderRadius: ndwTokens.radius.xl,
              border: `1px solid ${ndwTokens.colors.border}`,
              background: ndwTokens.colors.surfaceRaised,
              boxShadow: ndwTokens.shadows.sm,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(120px, 0.6fr))",
                gap: ndwTokens.spacing.lg,
                alignItems: "start",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: ndwTokens.colors.textMuted,
                    fontSize: ndwTokens.typography.sizes.caption,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  Cliente
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    color: ndwTokens.colors.textPrimary,
                    fontSize: ndwTokens.typography.sizes.sectionTitle,
                    wordBreak: "break-word",
                  }}
                >
                  {profile.email ?? "Email non disponibile"}
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: ndwTokens.colors.textMuted,
                    fontSize: ndwTokens.typography.sizes.small,
                    wordBreak: "break-word",
                  }}
                >
                  {profile.id}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, color: ndwTokens.colors.textMuted }}>
                  Ruolo
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: ndwTokens.colors.textPrimary,
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  {profile.role ?? "user"}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, color: ndwTokens.colors.textMuted }}>
                  Account
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: profile.is_active
                      ? ndwTokens.colors.primary
                      : ndwTokens.colors.danger,
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  {profile.is_active ? "Attivo" : "Disattivato"}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, color: ndwTokens.colors.textMuted }}>
                  Moduli attivi
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: ndwTokens.colors.textPrimary,
                    fontWeight: ndwTokens.typography.weights.bold,
                  }}
                >
                  {activeEntitlements.length}
                </p>
              </div>
            </div>

            <div style={{ marginTop: ndwTokens.spacing.lg }}>
              <p
                style={{
                  margin: 0,
                  color: ndwTokens.colors.textMuted,
                  fontWeight: ndwTokens.typography.weights.bold,
                }}
              >
                Entitlements
              </p>

              {entitlements.length > 0 ? (
                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  {entitlements.map((entitlement: EntitlementRow) => (
                    <div
                      key={`${entitlement.user_id}-${entitlement.module_key}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 0.7fr 0.7fr 0.7fr 1fr",
                        gap: 10,
                        padding: 12,
                        borderRadius: ndwTokens.radius.md,
                        border: `1px solid ${ndwTokens.colors.border}`,
                        background: ndwTokens.colors.surface,
                        color: ndwTokens.colors.textSecondary,
                        fontSize: ndwTokens.typography.sizes.small,
                      }}
                    >
                      <span>{entitlement.module_key}</span>
                      <span>{entitlement.plan_code ?? "—"}</span>
                      <span>{entitlement.provider ?? "—"}</span>
                      <span>
                        {entitlement.is_active ? "Attivo" : "Inattivo"}
                      </span>
                      <span>{formatDate(entitlement.updated_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    margin: "10px 0 0",
                    color: ndwTokens.colors.textMuted,
                  }}
                >
                  Nessun entitlement presente.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}