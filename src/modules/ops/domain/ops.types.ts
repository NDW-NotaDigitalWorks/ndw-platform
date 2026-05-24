export type OpsAreaKey =
  | "dashboard"
  | "assets"
  | "tasks"
  | "clients"
  | "sales"
  | "workflows";

export type OpsAreaStatus = "active" | "planned" | "locked";

export type OpsAreaDefinition = {
  key: OpsAreaKey;
  title: string;
  description: string;
  status: OpsAreaStatus;
  href: string;
};