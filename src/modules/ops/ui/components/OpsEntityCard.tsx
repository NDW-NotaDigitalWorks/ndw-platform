import Link from "next/link";
import type { OpsEntityCardViewModel } from "@/modules/ops/domain/ops.view-models";
import { NdwActionBar, NdwButton } from "@/components/ndw";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import OpsStatusPill from "./OpsStatusPill";
import OpsTaskStatusActions from "./OpsTaskStatusActions";

type Props = {
  entity: OpsEntityCardViewModel;
};

export default function OpsEntityCard({ entity }: Props) {
  return (
    <article
      style={{
        padding: ndwTokens.spacing.xl,
        borderRadius: ndwTokens.radius["2xl"],
        border: `1px solid ${ndwTokens.colors.border}`,
        background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
        boxShadow: ndwTokens.shadows.sm,
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
        <div>
          <h3
            style={{
              margin: 0,
              color: ndwTokens.colors.textPrimary,
              fontSize: ndwTokens.typography.sizes.cardTitle,
              fontWeight: ndwTokens.typography.weights.black,
              lineHeight: ndwTokens.typography.lineHeights.snug,
            }}
          >
            {entity.title}
          </h3>

          {entity.subtitle ? (
            <p
              style={{
                margin: "10px 0 0",
                color: ndwTokens.colors.textSecondary,
                fontSize: ndwTokens.typography.sizes.body,
                lineHeight: ndwTokens.typography.lineHeights.normal,
              }}
            >
              {entity.subtitle}
            </p>
          ) : null}
        </div>

        <OpsStatusPill
          label={entity.statusLabel}
          tone="muted"
        />
      </div>

      {entity.href ? (
        <div style={{ marginTop: ndwTokens.spacing.lg }}>
          <Link href={entity.href} style={{ textDecoration: "none" }}>
            <NdwButton variant="secondary">Apri</NdwButton>
          </Link>
        </div>
      ) : null}

      <div style={{ marginTop: ndwTokens.spacing.lg }}>
        <NdwActionBar align="left">
          <OpsTaskStatusActions entity={entity} />
        </NdwActionBar>
      </div>
    </article>
  );
}