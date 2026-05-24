import { getOpsDashboardViewModel } from "@/modules/ops/server/ops.queries";
import OpsDashboardView from "./OpsDashboardView";

export default async function OpsModulePage() {
  const workspace = await getOpsDashboardViewModel();

  return <OpsDashboardView workspace={workspace} />;
}