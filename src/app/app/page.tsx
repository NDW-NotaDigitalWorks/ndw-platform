import { getCoreWorkspaceData } from "@/modules/core/workspace/workspace.queries";
import { NdwModuleCard } from "@/components/ndw";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

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
        Workspace
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
        {workspace.title}
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
        {workspace.subtitle}
      </p>

      {showAccessDenied ? (
        <div
          style={{
            marginTop: ndwTokens.spacing.xl,
            padding: ndwTokens.spacing.lg,
            border: `1px solid ${ndwTokens.colors.danger}`,
            background: ndwTokens.colors.dangerSoft,
            borderRadius: ndwTokens.radius.lg,
            color: ndwTokens.colors.danger,
            fontWeight: ndwTokens.typography.weights.bold,
          }}
        >
          Accesso negato: non hai i permessi per aprire quel modulo.
        </div>
      ) : null}

      <div style={{ marginTop: ndwTokens.spacing["3xl"] }}>
        <div style={{ marginBottom: ndwTokens.spacing.xl }}>
          <h2
            style={{
              margin: 0,
              color: ndwTokens.colors.textPrimary,
              fontSize: ndwTokens.typography.sizes.sectionTitle,
              fontWeight: ndwTokens.typography.weights.black,
            }}
          >
            Moduli NDW
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: ndwTokens.colors.textMuted,
              fontSize: ndwTokens.typography.sizes.body,
            }}
          >
            Ambienti operativi collegati al tuo workspace.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: ndwTokens.spacing.lg,
          }}
        >
          {workspace.modules.map((module) => {
            const targetHref = module.hasAccess
              ? module.href
              : `/app/upgrade?module=${module.key}`;

            return (
              <NdwModuleCard
                key={module.key}
                moduleKey={module.key}
                title={module.name}
                description={module.description}
                href={targetHref}
                hasAccess={module.hasAccess}
                requiredPlan={module.requiredPlan}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}