import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwActionBarProps = {
  children: React.ReactNode;
  align?: "left" | "right" | "between";
};

export function NdwActionBar({
  children,
  align = "right",
}: NdwActionBarProps) {
  const justifyContent =
    align === "left" ? "flex-start" : align === "between" ? "space-between" : "flex-end";

  return (
    <div
      style={{
        display: "flex",
        justifyContent,
        alignItems: "center",
        flexWrap: "wrap",
        gap: ndwTokens.spacing.md,
        padding: ndwTokens.spacing.lg,
        borderRadius: ndwTokens.radius.xl,
        border: `1px solid ${ndwTokens.colors.border}`,
        background: ndwTokens.colors.surface,
      }}
    >
      {children}
    </div>
  );
}