import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function NdwSectionHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: NdwSectionHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: ndwTokens.spacing.lg,
        marginBottom: ndwTokens.spacing.xl,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              marginBottom: 8,
              color: ndwTokens.colors.primary,
              fontSize: ndwTokens.typography.sizes.small,
              fontWeight: ndwTokens.typography.weights.bold,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {eyebrow}
          </div>
        )}

        <h2
          style={{
            margin: 0,
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.sectionTitle,
            fontWeight: ndwTokens.typography.weights.black,
            lineHeight: ndwTokens.typography.lineHeights.snug,
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              margin: "8px 0 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: ndwTokens.typography.sizes.body,
              lineHeight: ndwTokens.typography.lineHeights.normal,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div>{actions}</div>}
    </header>
  );
}