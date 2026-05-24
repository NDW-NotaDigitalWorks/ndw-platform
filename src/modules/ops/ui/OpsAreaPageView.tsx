import type { OpsAreaDefinition } from "@/modules/ops/domain/ops.types";
import OpsModuleShell from "./OpsModuleShell";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

type Props = {
  area: OpsAreaDefinition;
};

export default function OpsAreaPageView({ area }: Props) {
  return (
    <OpsModuleShell>
      <div style={ui.card.base}>
        <h2 style={ui.page.sectionTitle}>{area.title}</h2>

        <p
          style={{
            marginTop: 12,
            color: theme.colors.textMuted,
            lineHeight: 1.7,
          }}
        >
          Questa area è stata collegata correttamente alla struttura interna
          di NDW Ops. La business logic arriverà nei prossimi blocchi.
        </p>
      </div>
    </OpsModuleShell>
  );
}