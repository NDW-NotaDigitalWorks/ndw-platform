import Link from "next/link";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { NdwStatusPill } from "./NdwStatusPill";

type NdwModuleCardProps = {
  moduleKey: string;
  title: string;
  description: string;
  href: string;
  hasAccess?: boolean;
  requiredPlan?: string;
};

function getAccent(moduleKey: string) {
  return (
    ndwModuleAccents[moduleKey as keyof typeof ndwModuleAccents] ??
    ndwModuleAccents.core
  );
}

export function NdwModuleCard({
  moduleKey,
  title,
  description,
  href,
  hasAccess = false,
  requiredPlan,
}: NdwModuleCardProps) {
  const accent = getAccent(moduleKey);

  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <article
        style={{
          minHeight: 220,
          padding: ndwTokens.spacing.xl,
          borderRadius: ndwTokens.radius["2xl"],
          border: `1px solid ${
            hasAccess ? accent.accentBorder : ndwTokens.colors.border
          }`,
          background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
          boxShadow: ndwTokens.shadows.sm,
          transition: ndwTokens.motion.normal,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: ndwTokens.spacing.md,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: ndwTokens.radius.lg,
              background: accent.accentSoft,
              border: `1px solid ${accent.accentBorder}`,
            }}
          />

          <NdwStatusPill
            label={hasAccess ? "Attivo" : "Upgrade"}
            variant={hasAccess ? "success" : "warning"}
          />
        </div>

        <strong
          style={{
            display: "block",
            marginTop: ndwTokens.spacing.lg,
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.cardTitle,
            fontWeight: ndwTokens.typography.weights.black,
          }}
        >
          {title}
        </strong>

        <p
          style={{
            margin: "10px 0 0",
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.body,
            lineHeight: ndwTokens.typography.lineHeights.normal,
          }}
        >
          {description}
        </p>

        {requiredPlan ? (
          <p
            style={{
              margin: "16px 0 0",
              color: ndwTokens.colors.textMuted,
              fontSize: ndwTokens.typography.sizes.small,
            }}
          >
            Piano richiesto:{" "}
            <strong style={{ color: ndwTokens.colors.textSecondary }}>
              {requiredPlan}
            </strong>
          </p>
        ) : null}

        <p
          style={{
            margin: "20px 0 0",
            color: accent.accentText,
            fontSize: ndwTokens.typography.sizes.body,
            fontWeight: ndwTokens.typography.weights.black,
          }}
        >
          {hasAccess ? "Apri modulo →" : "Sblocca modulo →"}
        </p>
      </article>
    </Link>
  );
}