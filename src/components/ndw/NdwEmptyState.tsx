import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function NdwEmptyState({
  eyebrow,
  title,
  description,
  action,
}: NdwEmptyStateProps) {
  return (
    <section
      style={{
        padding: ndwTokens.spacing["3xl"],
        borderRadius: ndwTokens.radius["2xl"],
        border: `1px dashed ${ndwTokens.colors.borderStrong}`,
        background: ndwTokens.colors.surface,
        textAlign: "center",
      }}
    >
      {eyebrow ? (
        <p
          style={{
            margin: 0,
            color: ndwTokens.colors.primary,
            fontSize: ndwTokens.typography.sizes.caption,
            fontWeight: ndwTokens.typography.weights.black,
            textTransform: "uppercase",
            letterSpacing: 1.1,
          }}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        style={{
          margin: eyebrow ? "12px 0 0" : 0,
          color: ndwTokens.colors.textPrimary,
          fontSize: ndwTokens.typography.sizes.sectionTitle,
          fontWeight: ndwTokens.typography.weights.black,
        }}
      >
        {title}
      </h2>

      {description ? (
        <p
          style={{
            margin: "10px auto 0",
            maxWidth: 560,
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.body,
            lineHeight: ndwTokens.typography.lineHeights.normal,
          }}
        >
          {description}
        </p>
      ) : null}

      {action ? <div style={{ marginTop: ndwTokens.spacing.xl }}>{action}</div> : null}
    </section>
  );
}