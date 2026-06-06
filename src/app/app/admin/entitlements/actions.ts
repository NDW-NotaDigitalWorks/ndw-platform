"use server";

import {
  grantModuleAccess,
  grantModuleAccessByEmail,
  revokeModuleAccess,
  revokeModuleAccessByEmail,
} from "@/modules/billing/server/billing-access";
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

function parseProvider(value: FormDataEntryValue | null): "manual" | "whop" {
  const provider = String(value);

  if (provider === "manual" || provider === "whop") {
    return provider;
  }

  return "manual";
}

function getErrorRedirectPath(action: "grant" | "revoke", error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (message.includes("No profile found")) {
    return `/app/admin/entitlements?error=no-profile&action=${action}`;
  }

  if (message.includes("Missing user identifier")) {
    return `/app/admin/entitlements?error=missing-user&action=${action}`;
  }

  return `/app/admin/entitlements?error=generic&action=${action}`;
}

export async function grantManualEntitlementAction(formData: FormData) {
  const access = await getMyCoreAccessState();
  assertOwner(access.profile?.role);

  try {
    const userId = String(formData.get("userId") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const moduleKey = String(formData.get("moduleKey"));
    const planCode = parsePlanCode(formData.get("planCode"));
    const provider = parseProvider(formData.get("provider"));

    if (email) {
      await grantModuleAccessByEmail({
        email,
        moduleKey,
        planCode,
        provider,
      });
    } else if (userId) {
      await grantModuleAccess({
        userId,
        moduleKey,
        planCode,
        provider,
      });
    } else {
      throw new Error("Missing user identifier");
    }
  } catch (error) {
    redirect(getErrorRedirectPath("grant", error));
  }

  redirect("/app/admin/entitlements?success=grant");
}

export async function revokeManualEntitlementAction(formData: FormData) {
  const access = await getMyCoreAccessState();
  assertOwner(access.profile?.role);

  try {
    const userId = String(formData.get("userId") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const moduleKey = String(formData.get("moduleKey"));

    if (email) {
      await revokeModuleAccessByEmail({
        email,
        moduleKey,
      });
    } else if (userId) {
      await revokeModuleAccess({
        userId,
        moduleKey,
      });
    } else {
      throw new Error("Missing user identifier");
    }
  } catch (error) {
    redirect(getErrorRedirectPath("revoke", error));
  }

  redirect("/app/admin/entitlements?success=revoke");
}