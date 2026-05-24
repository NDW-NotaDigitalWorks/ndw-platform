import type { ReactNode } from "react";

import OpsSectionControls from "./OpsSectionControls";
import OpsSectionHeader from "./OpsSectionHeader";

type Props = {
  title: string;
  subtitle?: string;


  primaryActionLabel?: string;

  actions?: ReactNode;

  children: ReactNode;
};

export default function OpsListSection({
  title,
  subtitle,

  primaryActionLabel = "Nuovo elemento",

  actions,

  children,
}: Props) {
  return (
    <section>
      <OpsSectionHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
      />

      <div style={{ marginTop: 18 }}>
        <OpsSectionControls
          primaryActionLabel={primaryActionLabel}
        />
      </div>

      <div style={{ marginTop: 22 }}>
  {children}
</div>
    </section>
  );
}