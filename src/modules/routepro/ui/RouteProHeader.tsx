import type { CSSProperties } from "react";
import Image from "next/image";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type RouteProHeaderProps = {
  title?: string;
  subtitle?: string;
};

const accent = ndwModuleAccents.routepro;

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: ndwTokens.spacing.md,
  marginBottom: 22,
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const logoStyle: CSSProperties = {
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  display: "block",
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: accent.accent,
};

const subtitleStyle: CSSProperties = {
  fontSize: 13,
  margin: "6px 0 0",
  color: ndwTokens.colors.textMuted,
  fontWeight: 700,
};

export function RouteProHeader({
  title = "RoutePro",
  subtitle = "Import your stops. Review your route. Drive smarter.",
}: RouteProHeaderProps) {
  return (
    <div style={headerStyle}>
      <div style={brandStyle}>
        <div style={logoStyle}>
          <Image
            src="/brand/routepro/routepro-symbol-master.png"
            alt="RoutePro"
            width={48}
            height={48}
            priority
            style={{
              width: "48px",
              height: "48px",
              objectFit: "contain",
            }}
          />
        </div>

        <div>
          <strong style={titleStyle}>{title}</strong>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}