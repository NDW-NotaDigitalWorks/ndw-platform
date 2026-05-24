import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsSalesSectionViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsSalesSectionView from "@/modules/ops/ui/sections/OpsSalesSectionView";

export default async function OpsSalesPage() {
  const [section, context] = await Promise.all([
    getOpsSalesSectionViewModel(),
    getOpsNavigationContext("sales"),
  ]);

  return (
    <OpsModuleShell context={context}>
      <OpsSalesSectionView section={section} />
    </OpsModuleShell>
  );
}