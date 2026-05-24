import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwCardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function NdwCard({ children, title, subtitle }: NdwCardProps) {
  return (
    <section
      style={{
        border: `1px solid ${ndwTokens.colors.border}`,
        background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
        borderRadius: ndwTokens.radius.xl,
        padding: ndwTokens.spacing.xl,
        boxShadow: ndwTokens.shadows.sm,
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: ndwTokens.spacing.lg }}>
          {title && (
            <h2
              style={{
                margin: 0,
                color: ndwTokens.colors.textPrimary,
                fontSize: ndwTokens.typography.sizes.cardTitle,
                fontWeight: ndwTokens.typography.weights.bold,
                lineHeight: ndwTokens.typography.lineHeights.snug,
              }}
            >
              {title}
            </h2>
          )}

          {subtitle && (
            <p
              style={{
                margin: "6px 0 0",
                color: ndwTokens.colors.textSecondary,
                fontSize: ndwTokens.typography.sizes.body,
                lineHeight: ndwTokens.typography.lineHeights.normal,
              }}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}

      {children}
    </section>
  );
}