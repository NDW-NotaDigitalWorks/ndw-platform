import { redirect } from "next/navigation";
import { userHasModuleAccess } from "@/modules/core/server/module-entitlements";

export default async function RouteProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAccess = await userHasModuleAccess("routepro");

  if (!hasAccess) {
    redirect("/app/upgrade?module=routepro");
  }

  return children;
}
