import type { ReactNode } from "react";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function OpsAttentionBlock({
  title,
  description,
  children,
}: Props) {
  return (
    <div
      style={{
        border: `1px solid ${ndwTokens.colors.warning}`,
        background: ndwTokens.colors.warningSoft,
        borderRadius: ndwTokens.radius.xl,
        padding: ndwTokens.spacing.xl,
        boxShadow: ndwTokens.shadows.sm,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: ndwTokens.typography.sizes.cardTitle,
          fontWeight: ndwTokens.typography.weights.black,
          color: "#FBBF24",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: ndwTokens.typography.sizes.body,
          lineHeight: ndwTokens.typography.lineHeights.normal,
          color: ndwTokens.colors.textSecondary,
        }}
      >
        {description}
      </p>

      {children ? <div style={{ marginTop: ndwTokens.spacing.lg }}>{children}</div> : null}
    </div>
  );
}