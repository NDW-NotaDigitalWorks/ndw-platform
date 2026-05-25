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
    <>
      <style>
        {`
          @media (max-width: 760px) {
            .ndw-module-card {
              min-height: auto !important;
              padding: 18px !important;
              border-radius: 24px !important;
            }

            .ndw-module-card-header {
              gap: 12px !important;
            }

            .ndw-module-card-icon {
              width: 40px !important;
              height: 40px !important;
              border-radius: 14px !important;
            }

            .ndw-module-card-title {
              margin-top: 14px !important;
              font-size: 22px !important;
              line-height: 1.12 !important;
            }

            .ndw-module-card-description {
              font-size: 16px !important;
              line-height: 1.45 !important;
            }

            .ndw-module-card-plan {
              margin-top: 12px !important;
              font-size: 14px !important;
            }

            .ndw-module-card-cta {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              min-height: 42px !important;
              margin-top: 16px !important;
              padding: 0 14px !important;
              border-radius: 14px !important;
              border: 1px solid ${accent.accentBorder} !important;
              background: ${accent.accentSoft} !important;
            }
          }
        `}
      </style>

      <Link
        href={href}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "100%",
          textDecoration: "none",
          color: "inherit",
          boxSizing: "border-box",
        }}
      >
        <article
          className="ndw-module-card"
          style={{
            minHeight: 220,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
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
            className="ndw-module-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: ndwTokens.spacing.md,
            }}
          >
            <div
              className="ndw-module-card-icon"
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
            className="ndw-module-card-title"
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
            className="ndw-module-card-description"
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
              className="ndw-module-card-plan"
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
            className="ndw-module-card-cta"
            style={{
              margin: "20px 0 0",
              color: accent.accentText,
              fontSize: ndwTokens.typography.sizes.body,
              fontWeight: ndwTokens.typography.weights.black,
            }}
          >
            <span>{hasAccess ? "Apri modulo" : "Sblocca modulo"}</span>
            <span>→</span>
          </p>
        </article>
      </Link>
    </>
  );
}