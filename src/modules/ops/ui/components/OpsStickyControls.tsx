import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function OpsStickyControls({
  children,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#f9fafb",
        paddingBottom: 12,
      }}
    >
      {children}
    </div>
  );
}