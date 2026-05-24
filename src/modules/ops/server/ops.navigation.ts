import { getOpsAreas } from "@/modules/ops/registry/ops.registry";

export type OpsBreadcrumbItem = {
  label: string;
  href: string;
};

export type OpsNavigationContext = {
  currentAreaKey: string;
  currentAreaTitle: string;
  currentAreaDescription: string;
  breadcrumbs: OpsBreadcrumbItem[];
};

export async function getOpsNavigationContext(
  areaKey: string,
): Promise<OpsNavigationContext> {
  const areas = getOpsAreas();
  const area = areas.find((item) => item.key === areaKey);

  if (!area) {
    return {
      currentAreaKey: "dashboard",
      currentAreaTitle: "Dashboard",
      currentAreaDescription: "Vista centrale del modulo NDW Ops.",
      breadcrumbs: [
        {
          label: "Ops",
          href: "/app/ops",
        },
      ],
    };
  }

  return {
    currentAreaKey: area.key,
    currentAreaTitle: area.title,
    currentAreaDescription: area.description,
    breadcrumbs: [
      {
        label: "Ops",
        href: "/app/ops",
      },
      {
        label: area.title,
        href: area.href,
      },
    ],
  };
}