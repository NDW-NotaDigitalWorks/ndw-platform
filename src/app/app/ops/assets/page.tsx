import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsAssetsSectionViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsAssetsSectionView from "@/modules/ops/ui/sections/OpsAssetsSectionView";

export default async function OpsAssetsPage() {
  const [section, context] = await Promise.all([
    getOpsAssetsSectionViewModel(),
    getOpsNavigationContext("assets"),
  ]);

  return (
    <OpsModuleShell context={context}>
      <OpsAssetsSectionView section={section} />
    </OpsModuleShell>
  );
}