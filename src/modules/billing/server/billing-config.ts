import type { BillingPlanCode } from "@/modules/billing/types/billing.types";

export type BillingModulePlan = {
  moduleKey: string;
  planCode: BillingPlanCode;
  label: string;
  provider: "manual" | "whop";
  checkoutUrl?: string;
};

export const BILLING_MODULE_PLANS: BillingModulePlan[] = [
  {
    moduleKey: "core",
    planCode: "free",
    label: "NDW Core Free",
    provider: "manual",
  },
  {
    moduleKey: "agenda",
    planCode: "base",
    label: "Agenda Base",
    provider: "manual",
  },
  {
    moduleKey: "routepro",
    planCode: "base",
    label: "RoutePro Base",
    provider: "manual",
  },
  {
    moduleKey: "routepro",
    planCode: "pro",
    label: "RoutePro",
    provider: "whop",
    checkoutUrl: "/app/checkout/routepro",
  },
  {
    moduleKey: "routepro",
    planCode: "elite",
    label: "RoutePro Elite",
    provider: "manual",
  },
];

export function getBillingPlansForModule(moduleKey: string) {
  return BILLING_MODULE_PLANS.filter((plan) => plan.moduleKey === moduleKey);
}

export function getPrimaryBillingPlanForModule(moduleKey: string) {
  return BILLING_MODULE_PLANS.find(
    (plan) => plan.moduleKey === moduleKey && plan.checkoutUrl,
  );
}