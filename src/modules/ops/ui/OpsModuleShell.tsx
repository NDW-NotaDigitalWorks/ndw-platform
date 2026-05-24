import Link from "next/link";
import type { ReactNode } from "react";
import type { OpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { OPS_AREAS } from "@/modules/ops/registry/ops.registry";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";
import OpsAreaNavigation from "./components/OpsAreaNavigation";
import OpsContextBar from "./components/OpsContextBar";

type Props = {
  children: ReactNode;
  context?: OpsNavigationContext;
};

export default function OpsModuleShell({ children, context }: Props) {
  return (
    <section style={ui.page.section}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={ui.page.eyebrow}>NDW Ops</p>
          <h1 style={ui.page.title}>Ops Workspace</h1>
          <p style={ui.page.subtitle}>
            Sistema operativo modulare per workflow, organizzazione e micro-business.
          </p>
        </div>

        <Link href="/app" style={ui.button.secondary}>
          Torna al Core
        </Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <OpsAreaNavigation
          areas={OPS_AREAS}
          currentAreaKey={context?.currentAreaKey}
        />
      </div>

      {context ? <OpsContextBar context={context} /> : null}

      <div
        style={{
          marginTop: 32,
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: 28,
        }}
      >
        {children}
      </div>
    </section>
  );
}