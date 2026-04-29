import Link from "next/link";
import { getCoreWorkspaceData } from "@/modules/core/workspace/workspace.queries";
import { theme } from "@/styles/theme";
import { ui } from "@/styles/ui";

type AppPageProps = {
  searchParams: Promise<{
    accessDenied?: string;
    "access-denied"?: string;
  }>;
};

export default async function AppPage({ searchParams }: AppPageProps) {
  const params = await searchParams;
  const workspace = await getCoreWorkspaceData();

  const showAccessDenied =
    params.accessDenied === "1" || params["access-denied"] === "1";

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>Workspace</p>
      <h1 style={ui.page.title}>{workspace.title}</h1>
      <p style={ui.page.subtitle}>{workspace.subtitle}</p>

      {showAccessDenied ? (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            borderRadius: 12,
            color: "#991b1b",
          }}
        >
          Accesso negato: non hai i permessi per aprire quel modulo.
        </div>
      ) : null}

      <div style={{ marginTop: 36 }}>
        <h2 style={ui.page.sectionTitle}>Moduli NDW</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {workspace.modules.map((module) => {
            const targetHref = module.hasAccess
              ? module.href
              : `/app/upgrade?module=${module.key}`;

            return (
              <Link
                key={module.key}
                href={targetHref}
                style={{
                  ...ui.card.base,
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  opacity: module.hasAccess ? 1 : 0.82,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: 18 }}>{module.name}</strong>

                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: module.hasAccess ? "#ecfdf5" : "#fef3c7",
                      color: module.hasAccess ? "#047857" : "#92400e",
                      fontWeight: 800,
                    }}
                  >
                    {module.hasAccess ? "Attivo" : "Upgrade"}
                  </span>
                </div>

                <p
                  style={{
                    marginTop: 10,
                    color: theme.colors.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  {module.description}
                </p>

                <p
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: theme.colors.textMuted,
                  }}
                >
                  Piano richiesto:{" "}
                  <strong style={{ color: theme.colors.textSecondary }}>
                    {module.requiredPlan}
                  </strong>
                </p>

                <p
                  style={{
                    marginTop: 18,
                    fontSize: 14,
                    fontWeight: 800,
                    color: theme.colors.primary,
                  }}
                >
                  {module.hasAccess ? "Apri modulo →" : "Sblocca modulo →"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}