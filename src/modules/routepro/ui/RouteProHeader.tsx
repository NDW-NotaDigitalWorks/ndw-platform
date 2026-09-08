import type { CSSProperties } from "react";
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
  width: 46,
  height: 46,
  borderRadius: ndwTokens.radius.lg,
  background: `linear-gradient(
    135deg,
    ${accent.accent} 0%,
    ${accent.accentHighlight} 100%
  )`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: ndwTokens.colors.textPrimary,
  fontWeight: 950,
  fontSize: 16,
  letterSpacing: "-0.03em",
  boxShadow: "0 14px 30px rgba(255,122,0,0.28)",
  border: "1px solid rgba(255,255,255,0.18)",
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
        <div style={logoStyle}>RP</div>

        <div>
          <strong style={titleStyle}>{title}</strong>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}