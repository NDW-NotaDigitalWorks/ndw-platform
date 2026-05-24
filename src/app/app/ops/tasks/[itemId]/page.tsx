import { notFound } from "next/navigation";
import { getOpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { getOpsTaskDetailViewModel } from "@/modules/ops/server/ops.queries";
import OpsModuleShell from "@/modules/ops/ui/OpsModuleShell";
import OpsTaskDetailView from "@/modules/ops/ui/OpsTaskDetailView";

type Props = {
  params: Promise<{
    itemId: string;
  }>;
};

export default async function OpsTaskDetailPage({ params }: Props) {
  const { itemId } = await params;

  const [detail, context] = await Promise.all([
    getOpsTaskDetailViewModel(itemId),
    getOpsNavigationContext("tasks"),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <OpsModuleShell context={context}>
      <OpsTaskDetailView detail={detail} />
    </OpsModuleShell>
  );
}