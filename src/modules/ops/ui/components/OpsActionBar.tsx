import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function OpsActionBar({ children }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}