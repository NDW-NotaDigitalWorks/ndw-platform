import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function OpsWorkflowCta({
  title,
  description,
  actions,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        background: "#ffffff",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          marginTop: 12,
          lineHeight: 1.7,
          color: "#6b7280",
        }}
      >
        {description}
      </p>

      {actions ? (
        <div style={{ marginTop: 20 }}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}