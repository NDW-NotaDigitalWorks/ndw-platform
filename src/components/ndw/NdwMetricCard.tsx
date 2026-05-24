import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwMetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
};

export function NdwMetricCard({
  label,
  value,
  description,
  trend,
}: NdwMetricCardProps) {
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
      <p
        style={{
          margin: 0,
          color: ndwTokens.colors.textMuted,
          fontSize: ndwTokens.typography.sizes.caption,
          fontWeight: ndwTokens.typography.weights.black,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </p>

      <strong
        style={{
          display: "block",
          marginTop: ndwTokens.spacing.md,
          color: ndwTokens.colors.textPrimary,
          fontSize: 34,
          fontWeight: ndwTokens.typography.weights.black,
          lineHeight: ndwTokens.typography.lineHeights.tight,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </strong>

      {description ? (
        <p
          style={{
            margin: "10px 0 0",
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.small,
            lineHeight: ndwTokens.typography.lineHeights.normal,
          }}
        >
          {description}
        </p>
      ) : null}

      {trend ? (
        <p
          style={{
            margin: "14px 0 0",
            color: ndwTokens.colors.success,
            fontSize: ndwTokens.typography.sizes.small,
            fontWeight: ndwTokens.typography.weights.bold,
          }}
        >
          {trend}
        </p>
      ) : null}
    </article>
  );
}