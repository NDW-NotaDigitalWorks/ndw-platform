import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type NdwButtonProps = {
  children: React.ReactNode;
  variant?: NdwButtonVariant;
  type?: "button" | "submit" | "reset";
};

export function NdwButton({
  children,
  variant = "primary",
  type = "button",
}: NdwButtonProps) {
  const stylesByVariant: Record<NdwButtonVariant, React.CSSProperties> = {
    primary: {
      background: ndwTokens.colors.primary,
      color: ndwTokens.colors.textPrimary,
      border: `1px solid ${ndwTokens.colors.primary}`,
    },
    secondary: {
      background: ndwTokens.colors.surfaceRaised,
      color: ndwTokens.colors.textPrimary,
      border: `1px solid ${ndwTokens.colors.borderStrong}`,
    },
    ghost: {
      background: "transparent",
      color: ndwTokens.colors.textSecondary,
      border: `1px solid transparent`,
    },
    danger: {
      background: ndwTokens.colors.danger,
      color: ndwTokens.colors.textPrimary,
      border: `1px solid ${ndwTokens.colors.danger}`,
    },
  };

  return (
    <button
      type={type}
      style={{
        ...stylesByVariant[variant],
        minHeight: 42,
        borderRadius: ndwTokens.radius.md,
        padding: "0 16px",
        fontSize: ndwTokens.typography.sizes.body,
        fontWeight: ndwTokens.typography.weights.bold,
        cursor: "pointer",
        transition: ndwTokens.motion.normal,
      }}
    >
      {children}
    </button>
  );
}