import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwBadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

type NdwBadgeProps = {
  children: React.ReactNode;
  variant?: NdwBadgeVariant;
};

export function NdwBadge({
  children,
  variant = "neutral",
}: NdwBadgeProps) {
  const stylesByVariant: Record<NdwBadgeVariant, React.CSSProperties> = {
    neutral: {
      background: ndwTokens.colors.neutralSoft,
      color: ndwTokens.colors.neutral,
    },

    success: {
      background: ndwTokens.colors.successSoft,
      color: ndwTokens.colors.success,
    },

    warning: {
      background: ndwTokens.colors.warningSoft,
      color: ndwTokens.colors.warning,
    },

    danger: {
      background: ndwTokens.colors.dangerSoft,
      color: ndwTokens.colors.danger,
    },

    info: {
      background: ndwTokens.colors.infoSoft,
      color: ndwTokens.colors.info,
    },
  };

  return (
    <span
      style={{
        ...stylesByVariant[variant],
        display: "inline-flex",
        alignItems: "center",
        minHeight: 28,
        padding: "0 10px",
        borderRadius: ndwTokens.radius.full,
        fontSize: ndwTokens.typography.sizes.small,
        fontWeight: ndwTokens.typography.weights.bold,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}