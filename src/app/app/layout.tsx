import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { NdwWorkspaceNav } from "@/components/ndw";

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

function getCurrentPathname(headersList: Headers) {
  const pathname =
    headersList.get("x-current-path") ??
    headersList.get("next-url") ??
    "/app";

  return pathname;
}

function getModuleAccent(moduleKey: string) {
  return (
    ndwModuleAccents[moduleKey as keyof typeof ndwModuleAccents] ??
    ndwModuleAccents.core
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) redirect("/login");
  if (!access.isActiveAccount) redirect("/account-disabled");

  const enabledModules = getEnabledModules();
  const activeKeys = await getMyActiveModuleKeys();
  const activeSet = new Set(activeKeys);

  const visibleModules = enabledModules.filter((module) =>
    activeSet.has(module.key),
  );

  const isOwner = isOwnerRole(access.profile?.role);
  const headersList = await headers();
  const pathname = getCurrentPathname(headersList);

  return (
    <>
      <style>
        {`
          @media (max-width: 760px) {
            .ndw-app-shell {
              display: block !important;
            }

            .ndw-sidebar {
              display: none !important;
            }

            .ndw-mobile-bar {
              display: flex !important;
            }

            .ndw-main {
  padding: 16px !important;
  width: 100% !important;
}

.ndw-mobile-bar {
  padding: 12px 14px !important;
}

.ndw-mobile-actions {
  display: flex !important;
  gap: 8px !important;
  align-items: center !important;
}
          }

          @media (min-width: 761px) {
            .ndw-mobile-bar {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        className="ndw-app-shell"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: `radial-gradient(circle at top left, ${ndwTokens.colors.primarySoft} 0, transparent 34%), ${ndwTokens.colors.background}`,
          color: ndwTokens.colors.textPrimary,
        }}
      >
        <aside
          className="ndw-sidebar"
          style={{
            width: ndwTokens.layout.sidebarWidth,
            padding: ndwTokens.spacing.xl,
            background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
            borderRight: `1px solid ${ndwTokens.colors.border}`,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <Link href="/app" style={{ textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: ndwTokens.radius.lg,
                background: ndwTokens.colors.primarySoft,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                color: ndwTokens.colors.primary,
                fontWeight: ndwTokens.typography.weights.black,
                marginBottom: ndwTokens.spacing.md,
              }}
            >
              NDW
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 22,
                lineHeight: 1.1,
                color: ndwTokens.colors.textPrimary,
              }}
            >
              NDW Core
            </strong>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: ndwTokens.typography.sizes.small,
                color: ndwTokens.colors.textMuted,
              }}
            >
              Nota Digital Works
            </p>
          </Link>

          <NdwWorkspaceNav
  pathname={pathname}
  modules={visibleModules}
  isOwner={isOwner}
/>

          <div
            style={{
              marginTop: 42,
              padding: ndwTokens.spacing.lg,
              borderRadius: ndwTokens.radius.xl,
              border: `1px solid ${ndwTokens.colors.border}`,
              background: ndwTokens.colors.surfaceRaised,
              boxShadow: ndwTokens.shadows.sm,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: ndwTokens.typography.sizes.caption,
                color: ndwTokens.colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: ndwTokens.typography.weights.bold,
              }}
            >
              Account
            </p>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: ndwTokens.typography.sizes.small,
                fontWeight: ndwTokens.typography.weights.bold,
                color: ndwTokens.colors.textPrimary,
                wordBreak: "break-word",
              }}
            >
              {access.user?.email}
            </p>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: ndwTokens.typography.sizes.small,
                color: ndwTokens.colors.textMuted,
              }}
            >
              Ruolo: {access.profile?.role}
            </p>

            <form action="/auth/logout" method="post" style={{ marginTop: 16 }}>
              <button
                type="submit"
                style={{
  width: "100%",
  minHeight: 42,
  padding: "0 14px",
  borderRadius: ndwTokens.radius.md,
  border: `1px solid ${ndwTokens.colors.border}`,
  background: ndwTokens.colors.surfaceSoft,
  color: ndwTokens.colors.textSecondary,
  fontSize: ndwTokens.typography.sizes.body,
  fontWeight: ndwTokens.typography.weights.bold,
  cursor: "pointer",
}}
              >
                Logout
              </button>
            </form>
          </div>
        </aside>

        <div
  className="ndw-mobile-bar"
  style={{
    display: "none",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    background: ndwTokens.colors.surface,
    borderBottom: `1px solid ${ndwTokens.colors.border}`,
    position: "sticky",
    top: 0,
    zIndex: ndwTokens.zIndex.sticky,
  }}
>
  <Link href="/app" style={{ textDecoration: "none", color: "inherit" }}>
    <div>
  <strong
    style={{
      display: "block",
      fontSize: 15,
      lineHeight: 1,
    }}
  >
    NDW Core
  </strong>

  <span
    style={{
      fontSize: 11,
      color: ndwTokens.colors.textMuted,
    }}
  >
    Operational Workspace
  </span>
</div>
  </Link>

  <div
  className="ndw-mobile-actions"
  style={{
    display: "flex",
    gap: 8,
  }}
>
    <Link
      href="/app"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        padding: "0 14px",
        borderRadius: ndwTokens.radius.md,
        border: `1px solid ${ndwTokens.colors.border}`,
        background: ndwTokens.colors.surfaceSoft,
        color: ndwTokens.colors.textSecondary,
        textDecoration: "none",
        fontSize: ndwTokens.typography.sizes.body,
        fontWeight: ndwTokens.typography.weights.bold,
      }}
    >
      Home
    </Link>

    <Link
      href="/app/upgrade"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        padding: "0 14px",
        borderRadius: ndwTokens.radius.md,
        border: `1px solid ${ndwTokens.colors.primary}`,
        background: ndwTokens.colors.primary,
        color: ndwTokens.colors.textPrimary,
        textDecoration: "none",
        fontSize: ndwTokens.typography.sizes.body,
        fontWeight: ndwTokens.typography.weights.bold,
      }}
    >
      Upgrade
    </Link>
  </div>
</div>

        <main
          className="ndw-main"
          style={{
            flex: 1,
            padding: ndwTokens.spacing["3xl"],
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}