import Link from "next/link";
import type { OpsAreaDefinition } from "@/modules/ops/domain/ops.types";
import { ui } from "@/styles/ui";

type Props = {
  areas: OpsAreaDefinition[];
  currentAreaKey?: string;
};

export default function OpsAreaNavigation({
  areas,
  currentAreaKey,
}: Props) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {areas.map((area) => {
        const isActive = area.key === currentAreaKey;

        return (
          <Link
            key={area.key}
            href={area.href}
            style={{
              ...ui.button.secondary,
              opacity: area.status === "active" ? 1 : 0.72,
              background: isActive ? "#111827" : undefined,
              color: isActive ? "#ffffff" : undefined,
            }}
          >
            {area.title}
          </Link>
        );
      })}
    </nav>
  );
}