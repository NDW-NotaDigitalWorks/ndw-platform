import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwStatusPillVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

type NdwStatusPillProps = {
  label: string;
  variant?: NdwStatusPillVariant;
};

export function NdwStatusPill({
  label,
  variant = "neutral",
}: NdwStatusPillProps) {
  const stylesByVariant: Record<NdwStatusPillVariant, React.CSSProperties> = {
    neutral: {
      background: ndwTokens.colors.neutralSoft,
      color: ndwTokens.colors.neutral,
      border: `1px solid ${ndwTokens.colors.border}`,
    },
    success: {
      background: ndwTokens.colors.successSoft,
      color: ndwTokens.colors.success,
      border: `1px solid rgba(34,197,94,0.24)`,
    },
    warning: {
      background: ndwTokens.colors.warningSoft,
      color: ndwTokens.colors.warning,
      border: `1px solid rgba(245,158,11,0.24)`,
    },
    danger: {
      background: ndwTokens.colors.dangerSoft,
      color: ndwTokens.colors.danger,
      border: `1px solid rgba(239,68,68,0.24)`,
    },
    info: {
      background: ndwTokens.colors.infoSoft,
      color: ndwTokens.colors.info,
      border: `1px solid rgba(56,189,248,0.24)`,
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
        fontWeight: ndwTokens.typography.weights.black,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}