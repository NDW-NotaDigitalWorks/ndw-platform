import type { OpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import OpsBreadcrumbs from "./OpsBreadcrumbs";
import { theme } from "@/styles/theme";

type Props = {
  context: OpsNavigationContext;
};

export default function OpsContextBar({ context }: Props) {
  return (
    <div
      style={{
        marginTop: 22,
        padding: 18,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 18,
        background: theme.colors.card,
      }}
    >
      <OpsBreadcrumbs items={context.breadcrumbs} />

      <p
        style={{
          margin: "12px 0 0",
          fontSize: 13,
          color: theme.colors.textMuted,
          lineHeight: 1.6,
        }}
      >
        Area corrente: <strong>{context.currentAreaTitle}</strong> —{" "}
        {context.currentAreaDescription}
      </p>
    </div>
  );
}