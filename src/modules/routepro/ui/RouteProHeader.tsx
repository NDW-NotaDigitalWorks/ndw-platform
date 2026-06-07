import type { CSSProperties } from "react";

type RouteProHeaderProps = {
  title?: string;
  subtitle?: string;
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
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
  borderRadius: 16,
  background:
    "linear-gradient(135deg, #ff7a00 0%, #f97316 45%, #0ea5e9 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontWeight: 950,
  fontSize: 16,
  letterSpacing: "-0.03em",
  boxShadow: "0 14px 30px rgba(255, 122, 0, 0.28)",
  border: "1px solid rgba(255,255,255,0.2)",
};

const titleStyle: CSSProperties = {
  display: "block",
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: "#ff7a00",
};

const subtitleStyle: CSSProperties = {
  fontSize: 13,
  margin: "6px 0 0",
  color: "#94a3b8",
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