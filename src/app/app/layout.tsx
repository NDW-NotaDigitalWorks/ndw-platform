import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { theme } from "@/styles/theme";
import { ui } from "@/styles/ui";

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
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
              padding: 18px !important;
              width: 100% !important;
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
          background: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <aside
          className="ndw-sidebar"
          style={{
            width: 280,
            padding: 24,
            background: theme.colors.card,
            borderRight: `1px solid ${theme.colors.border}`,
          }}
        >
          <Link href="/app" style={{ textDecoration: "none", color: "inherit" }}>
            <strong style={{ fontSize: 22 }}>NDW Core</strong>
            <p
              style={{
                marginTop: 4,
                fontSize: 13,
                color: theme.colors.textMuted,
              }}
            >
              Nota Digital Works
            </p>
          </Link>

          <nav style={{ marginTop: 34 }}>
            <p style={ui.page.eyebrow}>Workspace</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
              <li>
                <Link href="/app" style={ui.button.secondary}>
                  Dashboard
                </Link>
              </li>

              {visibleModules.map((module) => (
                <li key={module.key} style={{ marginTop: 10 }}>
                  <Link href={module.href} style={ui.button.secondary}>
                    {module.navLabel}
                  </Link>
                </li>
              ))}
            </ul>

            {isOwner ? (
              <div style={{ marginTop: 34 }}>
                <p style={ui.page.eyebrow}>Admin</p>

                <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
                  <li>
                    <Link href="/app/admin/entitlements" style={ui.button.secondary}>
                      Entitlements
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </nav>

          <div style={{ marginTop: 40, ...ui.card.base, padding: 18 }}>
            <p style={{ margin: 0, fontSize: 12, color: theme.colors.textMuted }}>
              Account
            </p>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {access.user?.email}
            </p>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: theme.colors.textMuted,
              }}
            >
              Ruolo: {access.profile?.role}
            </p>

            <form action="/auth/logout" method="post" style={{ marginTop: 16 }}>
              <button type="submit" style={ui.button.secondary}>
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
            background: theme.colors.card,
            borderBottom: `1px solid ${theme.colors.border}`,
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link href="/app/routepro" style={{ textDecoration: "none", color: "inherit" }}>
            <strong>RoutePro</strong>
          </Link>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/app" style={ui.button.secondary}>
              Home
            </Link>

            <Link href="/app/routepro" style={ui.button.primary}>
              Rotte
            </Link>
          </div>
        </div>

        <main className="ndw-main" style={{ flex: 1, padding: 36 }}>
          {children}
        </main>
      </div>
    </>
  );
}