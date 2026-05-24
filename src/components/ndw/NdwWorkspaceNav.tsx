import Link from "next/link";
import type { ModuleDefinition } from "@/modules/registry/types";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type Props = {
  pathname: string;
  modules: ModuleDefinition[];
  isOwner: boolean;
};

function getModuleAccent(moduleKey: string) {
  return (
    ndwModuleAccents[moduleKey as keyof typeof ndwModuleAccents] ??
    ndwModuleAccents.core
  );
}

const sidebarLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 42,
  padding: "0 14px",
  borderRadius: ndwTokens.radius.md,
  border: `1px solid ${ndwTokens.colors.border}`,
  background: ndwTokens.colors.surfaceSoft,
  color: ndwTokens.colors.textSecondary,
  textDecoration: "none",
  fontSize: ndwTokens.typography.sizes.body,
  fontWeight: ndwTokens.typography.weights.bold,
};

const sectionLabelStyle: React.CSSProperties = {
  margin: 0,
  color: ndwTokens.colors.textMuted,
  fontSize: ndwTokens.typography.sizes.caption,
  fontWeight: ndwTokens.typography.weights.black,
  textTransform: "uppercase",
  letterSpacing: 1.1,
};

export function NdwWorkspaceNav({ pathname, modules, isOwner }: Props) {
  const isDashboardActive = pathname === "/app";

  return (
    <nav style={{ marginTop: 36 }}>
      <p style={sectionLabelStyle}>Workspace</p>

      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
        <li>
          <Link
            href="/app"
            style={{
              ...sidebarLinkStyle,
              background: isDashboardActive
                ? ndwTokens.colors.primarySoft
                : ndwTokens.colors.surfaceSoft,
              borderColor: isDashboardActive
                ? ndwTokens.colors.primary
                : ndwTokens.colors.border,
              color: isDashboardActive
                ? ndwTokens.colors.textPrimary
                : ndwTokens.colors.textSecondary,
            }}
          >
            Dashboard
          </Link>
        </li>

        {modules.map((module) => {
          const isActive =
            pathname === module.href || pathname.startsWith(`${module.href}/`);

          const accent = getModuleAccent(module.key);

          return (
            <li key={module.key} style={{ marginTop: 10 }}>
              <Link
                href={module.href}
                style={{
                  ...sidebarLinkStyle,
                  background: isActive
                    ? accent.accentSoft
                    : ndwTokens.colors.surfaceSoft,
                  borderColor: isActive
                    ? accent.accent
                    : ndwTokens.colors.border,
                  color: isActive
                    ? ndwTokens.colors.textPrimary
                    : ndwTokens.colors.textSecondary,
                  boxShadow: isActive
                    ? `0 0 0 1px ${accent.accentBorder}`
                    : undefined,
                }}
              >
                <span>{module.navLabel}</span>

                {isActive ? (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: accent.accent,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {isOwner ? (
        <div style={{ marginTop: 36 }}>
          <p style={sectionLabelStyle}>Admin</p>

          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
            <li>
              <Link
                href="/app/admin/entitlements"
                style={sidebarLinkStyle}
              >
                Entitlements
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

export { sidebarLinkStyle };