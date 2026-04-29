"use server";

import { grantModuleAccess, revokeModuleAccess } from "@/modules/billing/server/billing-access";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";
import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { redirect } from "next/navigation";

function assertOwner(role: string | null | undefined) {
  if (role?.trim().toLowerCase() !== "owner") {
    throw new Error("Unauthorized");
  }
}

function parsePlanCode(value: FormDataEntryValue | null): BillingPlanCode {
  const plan = String(value);

  if (plan === "free" || plan === "base" || plan === "pro" || plan === "elite") {
    return plan;
  }

  throw new Error("Invalid plan code");
}

export async function grantManualEntitlementAction(formData: FormData) {
  const access = await getMyCoreAccessState();
  assertOwner(access.profile?.role);

  const userId = String(formData.get("userId"));
  const moduleKey = String(formData.get("moduleKey"));
  const planCode = parsePlanCode(formData.get("planCode"));

  await grantModuleAccess({
    userId,
    moduleKey,
    planCode,
    provider: "manual",
  });

  redirect("/app/admin/entitlements?success=grant");
}

export async function revokeManualEntitlementAction(formData: FormData) {
  const access = await getMyCoreAccessState();
  assertOwner(access.profile?.role);

  const userId = String(formData.get("userId"));
  const moduleKey = String(formData.get("moduleKey"));

  await revokeModuleAccess({
    userId,
    moduleKey,
  });

  redirect("/app/admin/entitlements?success=revoke");
}