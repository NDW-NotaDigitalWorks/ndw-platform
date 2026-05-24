import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsWorkflowsSectionViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsWorkflowsSectionView from "@/modules/ops/ui/sections/OpsWorkflowsSectionView";

export default async function OpsWorkflowsPage() {
  const [section, context] = await Promise.all([
    getOpsWorkflowsSectionViewModel(),
    getOpsNavigationContext("workflows"),
  ]);

  return (
    <OpsModuleShell context={context}>
      <OpsWorkflowsSectionView section={section} />
    </OpsModuleShell>
  );
}