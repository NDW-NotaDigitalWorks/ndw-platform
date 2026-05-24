import type { ReactNode } from "react";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function OpsSectionHeader({
  title,
  subtitle,
  actions,
}: Props) {
  return (
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
        <h2 style={ui.page.sectionTitle}>{title}</h2>

        {subtitle ? (
          <p
            style={{
              marginTop: 8,
              color: theme.colors.textMuted,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  );
}