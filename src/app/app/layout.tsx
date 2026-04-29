import Link from "next/link";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getMyActiveModuleKeys } from "@/modules/core/server/module-entitlements";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { redirect } from "next/navigation";

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMyCoreAccessState();

  if (!access.isAuthenticated) {
    redirect("/login");
  }

  if (!access.isActiveAccount) {
    redirect("/account-disabled");
  }

  const enabledModules = getEnabledModules();
  const activeKeys = await getMyActiveModuleKeys();
  const activeSet = new Set(activeKeys);

  const visibleModules = enabledModules.filter((module) =>
    activeSet.has(module.key)
  );

  const isOwner = isOwnerRole(access.profile?.role);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <aside
        style={{
          width: 260,
          padding: 24,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <div>
          <strong style={{ fontSize: 20 }}>NDW Core</strong>
          <p style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
            Nota Digital Works
          </p>
        </div>

        <nav style={{ marginTop: 32 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Workspace
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link href="/app">Dashboard</Link>
            </li>

            {visibleModules.map((module) => (
              <li key={module.key} style={{ marginTop: 12 }}>
                <Link href={module.href}>{module.navLabel}</Link>
              </li>
            ))}
          </ul>

          {isOwner ? (
            <div style={{ marginTop: 32 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Admin
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li>
                  <Link href="/app/admin/entitlements">Entitlements</Link>
                </li>
              </ul>
            </div>
          ) : null}
        </nav>

        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            Account
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>{access.user?.email}</p>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Ruolo: {access.profile?.role}
          </p>

          <form action="/auth/logout" method="post" style={{ marginTop: 16 }}>
            <button type="submit">Logout</button>
          </form>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}