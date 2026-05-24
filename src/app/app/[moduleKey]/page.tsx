import { userHasModuleAccess } from "@/modules/core/server/module-entitlements";
import { getModuleByKey } from "@/modules/registry/registry.queries";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ moduleKey: string }>;
};

export default async function ModulePage({ params }: Props) {
  const { moduleKey } = await params;

  const moduleDefinition = getModuleByKey(moduleKey);

  if (!moduleDefinition) {
    notFound();
  }

  const hasAccess = await userHasModuleAccess(moduleKey);

  if (!hasAccess) {
    redirect(`/app/upgrade?module=${moduleKey}`);
  }

  const Page = await moduleDefinition.loadPage();

  return <Page />;
}