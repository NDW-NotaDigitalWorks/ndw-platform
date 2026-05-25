import Image from "next/image";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwBrandProps = {
  compact?: boolean;
};

export function NdwBrand({ compact = false }: NdwBrandProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 10 : 12,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          borderRadius: ndwTokens.radius.lg,
          background: ndwTokens.colors.primarySoft,
          border: `1px solid ${ndwTokens.colors.borderStrong}`,
          boxShadow: ndwTokens.shadows.sm,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src="/brand/ndw/icon/ndw-mark.png"
          alt="NDW"
          width={compact ? 24 : 30}
          height={compact ? 24 : 30}
          priority
        />
      </div>

      <div style={{ minWidth: 0 }}>
        <strong
          style={{
            display: "block",
            fontSize: compact ? 15 : 22,
            lineHeight: 1.05,
            color: ndwTokens.colors.textPrimary,
            letterSpacing: "-0.03em",
          }}
        >
          NDW Core
        </strong>

        {compact ? (
          <span
            style={{
              display: "block",
              marginTop: 3,
              fontSize: 11,
              color: ndwTokens.colors.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            Operational Workspace
          </span>
        ) : (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: ndwTokens.typography.sizes.small,
              color: ndwTokens.colors.textMuted,
            }}
          >
            Nota Digital Works
          </p>
        )}
      </div>
    </div>
  );
}
