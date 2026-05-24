import Link from "next/link";
import type { OpsBreadcrumbItem } from "@/modules/ops/server/ops.navigation";

type Props = {
  items: OpsBreadcrumbItem[];
};

export default function OpsBreadcrumbs({
  items,
}: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        fontSize: 14,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.href}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Link
              href={item.href}
              style={{
                color: isLast ? "#111827" : "#6b7280",
                textDecoration: "none",
                fontWeight: isLast ? 800 : 500,
              }}
            >
              {item.label}
            </Link>

            {!isLast ? (
              <span style={{ color: "#9ca3af" }}>
                /
              </span>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}