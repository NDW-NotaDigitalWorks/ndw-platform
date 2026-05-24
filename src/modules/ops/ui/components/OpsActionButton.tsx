type OpsActionButtonVariant = "primary" | "secondary" | "disabled";

type Props = {
  label: string;
  variant?: OpsActionButtonVariant;
  buttonType?: "button" | "submit";
};

function getButtonStyle(variant: OpsActionButtonVariant) {
  switch (variant) {
    case "primary":
      return {
        background: "#111827",
        color: "#ffffff",
        border: "1px solid #111827",
      };
    case "secondary":
      return {
        background: "#ffffff",
        color: "#111827",
        border: "1px solid #e5e7eb",
      };
    case "disabled":
      return {
        background: "#f3f4f6",
        color: "#9ca3af",
        border: "1px solid #e5e7eb",
      };
  }
}

export default function OpsActionButton({
  label,
  variant = "secondary",
  buttonType = "button",
}: Props) {
  const style = getButtonStyle(variant);

  return (
    <button
      type={buttonType}
      disabled={variant === "disabled"}
      style={{
        ...style,
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        fontWeight: 800,
        cursor: variant === "disabled" ? "not-allowed" : "pointer",
        minHeight: 42,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}