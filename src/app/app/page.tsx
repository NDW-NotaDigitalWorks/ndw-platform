import Link from "next/link";
import { getCoreWorkspaceData } from "@/modules/core/workspace/workspace.queries";

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
    <section>
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>{workspace.title}</h1>
        <p style={{ color: "#64748b", marginTop: 0 }}>{workspace.subtitle}</p>
      </div>

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

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20 }}>Moduli NDW</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
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
                  display: "block",
                  padding: 20,
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  background: "#ffffff",
                  textDecoration: "none",
                  color: "inherit",
                  opacity: module.hasAccess ? 1 : 0.78,
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
                  <strong>{module.name}</strong>

                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: module.hasAccess ? "#ecfdf5" : "#fef3c7",
                      color: module.hasAccess ? "#047857" : "#92400e",
                    }}
                  >
                    {module.hasAccess ? "Attivo" : "Upgrade"}
                  </span>
                </div>

                <p style={{ marginTop: 8, color: "#64748b" }}>
                  {module.description}
                </p>

                <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                  Piano: {module.requiredPlan}
                </p>

                <p
                  style={{
                    marginTop: 16,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
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