import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function OpsAttentionBlock({
  title,
  description,
  children,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #fcd34d",
        background: "#fffbeb",
        borderRadius: 18,
        padding: 20,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          color: "#92400e",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          marginTop: 10,
          lineHeight: 1.7,
          color: "#78350f",
        }}
      >
        {description}
      </p>

      {children ? (
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}