import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLoginUrl, getSafeNextPath } from "@/lib/auth/auth-url";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { NdwWorkspaceNav, NdwBrand } from "@/components/ndw";

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

function getCurrentPathname(headersList: Headers) {
  return headersList.get("x-current-path") ?? "/app";
}

function getAuthNext(headersList: Headers) {
  return getSafeNextPath(
    headersList.get("x-auth-next") ??
      headersList.get("x-current-path") ??
      "/app",
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = getCurrentPathname(headersList);
  const authNext = getAuthNext(headersList);

  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) {
    redirect(getLoginUrl(authNext));
  }

  if (!access.isActiveAccount) {
    redirect("/account-disabled");
  }

  const enabledModules = getEnabledModules();
  const activeKeys = await getMyActiveModuleKeys();
  const activeSet = new Set(activeKeys);

  const visibleModules = enabledModules.filter((module) =>
    activeSet.has(module.key),
  );

  const isOwner = isOwnerRole(access.profile?.role);

  return (
    <>
      <style>
        {`
          @media (max-width: 760px) {
            .ndw-app-shell {
              display: block !important;
              width: 100% !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }

            .ndw-sidebar {
              display: none !important;
            }

            .ndw-mobile-bar {
              display: flex !important;
              padding: 10px 12px !important;
              width: 100% !important;
              max-width: 100vw !important;
              box-sizing: border-box !important;
            }

            .ndw-mobile-actions {
              display: flex !important;
              gap: 8px !important;
              align-items: center !important;
            }

            .ndw-main {
              padding: 14px !important;
              width: 100% !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }

            .ndw-main * {
              box-sizing: border-box !important;
            }

            .ndw-main section,
            .ndw-main a {
              max-width: 100% !important;
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
          <Link
            href="/app"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <NdwBrand />
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

            <Link
              href="/app/account"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 42,
                marginTop: 14,
                borderRadius: ndwTokens.radius.md,
                border: `1px solid ${ndwTokens.colors.border}`,
                background: ndwTokens.colors.surfaceSoft,
                color: ndwTokens.colors.textPrimary,
                textDecoration: "none",
                fontSize: ndwTokens.typography.sizes.body,
                fontWeight: ndwTokens.typography.weights.bold,
              }}
            >
              Gestisci account
            </Link>

            <form
              action="/auth/logout"
              method="post"
              style={{ marginTop: 12 }}
            >
              <button
                type="submit"
                style={{
                  width: "100%",
                  minHeight: 42,
                  padding: "0 14px",
                  borderRadius: ndwTokens.radius.md,
                  border: `1px solid ${ndwTokens.colors.border}`,
                  background: "transparent",
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
          <Link
            href="/app"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
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
              href="/app/account"
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
              Account
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
                color: "#ffffff",
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