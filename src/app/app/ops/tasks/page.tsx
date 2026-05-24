import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsTasksSectionViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsTasksSectionView from "@/modules/ops/ui/sections/OpsTasksSectionView";

export default async function OpsTasksPage() {
  const [section, context] = await Promise.all([
    getOpsTasksSectionViewModel(),
    getOpsNavigationContext("tasks"),
  ]);

  return (
    <OpsModuleShell context={context}>
      <OpsTasksSectionView section={section} />
    </OpsModuleShell>
  );
}