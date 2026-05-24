import Link from "next/link";
import type { OpsAreaViewModel } from "@/modules/ops/domain/ops.view-models";
import { NdwStatusPill } from "@/components/ndw";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type Props = {
  area: OpsAreaViewModel;
};

export default function OpsSectionCard({ area }: Props) {
  const accent = ndwModuleAccents.ops;

  return (
    <Link
      href={area.href}
      style={{
        display: "block",
        minHeight: 150,
        padding: ndwTokens.spacing.xl,
        borderRadius: ndwTokens.radius["2xl"],
        border: `1px solid ${accent.accentBorder}`,
        background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
        boxShadow: ndwTokens.shadows.sm,
        textDecoration: "none",
        color: "inherit",
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
        <strong
          style={{
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.cardTitle,
            fontWeight: ndwTokens.typography.weights.black,
          }}
        >
          {area.title}
        </strong>

        <NdwStatusPill
          label={area.badgeLabel}
          variant={area.status === "active" ? "success" : "warning"}
        />
      </div>

      <p
        style={{
          margin: "12px 0 0",
          color: ndwTokens.colors.textSecondary,
          fontSize: ndwTokens.typography.sizes.body,
          lineHeight: ndwTokens.typography.lineHeights.normal,
        }}
      >
        {area.description}
      </p>

      <p
        style={{
          margin: "18px 0 0",
          color: accent.accentText,
          fontSize: ndwTokens.typography.sizes.small,
          fontWeight: ndwTokens.typography.weights.black,
        }}
      >
        Apri area →
      </p>
    </Link>
  );
}