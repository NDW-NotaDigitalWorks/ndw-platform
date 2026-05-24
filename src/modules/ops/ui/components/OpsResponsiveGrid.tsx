import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  minColumnWidth?: number;
  gap?: number;
};

export default function OpsResponsiveGrid({
  children,
  minColumnWidth = 260,
  gap = 16,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}