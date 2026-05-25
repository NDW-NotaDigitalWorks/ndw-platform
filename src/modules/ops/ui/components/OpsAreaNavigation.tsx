import Link from "next/link";
import type { OpsAreaDefinition } from "@/modules/ops/domain/ops.types";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";

type Props = {
  areas: OpsAreaDefinition[];
  currentAreaKey?: string;
};

const opsAccent = ndwModuleAccents.ops;

export default function OpsAreaNavigation({
  areas,
  currentAreaKey,
}: Props) {
  return (
    <nav
      style={{
        display: "flex",
        gap: ndwTokens.spacing.sm,
        flexWrap: "wrap",
      }}
    >
      {areas.map((area) => {
        const isActive = area.key === currentAreaKey;
        const isEnabled = area.status === "active";

        return (
          <Link
            key={area.key}
            href={area.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "0 16px",
              borderRadius: ndwTokens.radius.md,
              border: `1px solid ${
                isActive ? opsAccent.accentBorder : ndwTokens.colors.borderStrong
              }`,
              background: isActive
                ? opsAccent.accentSoft
                : ndwTokens.colors.surfaceRaised,
              color: isActive
                ? opsAccent.accentText
                : ndwTokens.colors.textSecondary,
              fontSize: ndwTokens.typography.sizes.body,
              fontWeight: ndwTokens.typography.weights.bold,
              textDecoration: "none",
              opacity: isEnabled ? 1 : 0.9,
            }}
          >
            {area.title}
          </Link>
        );
      })}
    </nav>
  );
}