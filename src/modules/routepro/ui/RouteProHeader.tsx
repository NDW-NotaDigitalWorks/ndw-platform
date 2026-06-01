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
  marginBottom: 18,
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const logoStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: 900,
  boxShadow: "0 10px 24px rgba(14, 165, 233, 0.25)",
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
          <strong style={{ fontSize: 18 }}>{title}</strong>
          <p style={{ fontSize: 12, margin: 0, opacity: 0.65 }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}