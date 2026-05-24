import type { ReactNode } from "react";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function OpsEmptyState({
  title,
  description,
  action,
}: Props) {
  return (
    <div
      style={{
        ...ui.card.base,
        textAlign: "center",
        padding: 28,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          marginTop: 12,
          color: theme.colors.textMuted,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>

      {action ? (
        <div style={{ marginTop: 20 }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}