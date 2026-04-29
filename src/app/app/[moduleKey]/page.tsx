import { userHasModuleAccess } from "@/modules/core/server/module-entitlements";
import { getModuleByKey } from "@/modules/registry/registry.queries";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ moduleKey: string }>;
};

export default async function ModulePage({ params }: Props) {
  const { moduleKey } = await params;

  const module = getModuleByKey(moduleKey);

  if (!module) {
    notFound();
  }

  const hasAccess = await userHasModuleAccess(moduleKey);

  if (!hasAccess) {
    redirect(`/app/upgrade?module=${moduleKey}`);
  }

  const Page = await module.loadPage();

  return <Page />;
}