import type { ComponentType } from "react";

export type ModuleKey = string;

export type ModuleStatus = "active" | "beta" | "coming_soon";

export type ModuleCategory = "core" | "productivity" | "logistics" | "sales";

export type ModulePlanCode = "free" | "base" | "pro" | "elite";

export type ModulePageComponent = ComponentType;

export type ModuleDefinition = {
  key: ModuleKey;
  name: string;
  navLabel: string;
  description: string;
  category: ModuleCategory;
  status: ModuleStatus;
  requiredPlan: ModulePlanCode;
  isEnabled: boolean;
  href: string;
  loadPage: () => Promise<ModulePageComponent>;
};