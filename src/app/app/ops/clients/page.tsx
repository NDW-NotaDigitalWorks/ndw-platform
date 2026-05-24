import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsClientsSectionViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsClientsSectionView from "@/modules/ops/ui/sections/OpsClientsSectionView";

export default async function OpsClientsPage() {
  const [section, context] = await Promise.all([
    getOpsClientsSectionViewModel(),
    getOpsNavigationContext("clients"),
  ]);

  return (
    <OpsModuleShell context={context}>
      <OpsClientsSectionView section={section} />
    </OpsModuleShell>
  );
}