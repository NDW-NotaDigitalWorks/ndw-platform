import type { BillingPlanCode } from "@/modules/billing/types/billing.types";

type WhopPayloadObject = Record<string, unknown>;

function getNestedString(
  value: WhopPayloadObject,
  path: string[],
): string | null {
  let current: unknown = value;

  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
}

function normalize(value: string | null): string | null {
  return value?.trim().toLowerCase() ?? null;
}

export function getWhopEventType(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  return getNestedString(payload as WhopPayloadObject, ["type"]);
}

export function getWhopCustomerEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  return normalize(
    getNestedString(payload as WhopPayloadObject, ["data", "user", "email"]),
  );
}

export function getWhopProductRoute(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  return normalize(
    getNestedString(payload as WhopPayloadObject, ["data", "product", "route"]),
  );
}

export function mapWhopProductToModuleKey(
  productRoute: string | null,
): string | null {
  if (!productRoute) return null;

  const map: Record<string, string> = {
  routepro: "routepro",
  "routepro-pro-ad": "routepro",
  "routepro-driver": "routepro",
  "ndw-routepro": "routepro",
};

  return map[productRoute] ?? null;
}

export function mapWhopPayloadToPlanCode(payload: unknown): BillingPlanCode {
  if (!payload || typeof payload !== "object") return "pro";

  const planId = normalize(
    getNestedString(payload as WhopPayloadObject, ["data", "plan", "id"]),
  );

  const productRoute = getWhopProductRoute(payload);

  if (planId?.includes("elite") || productRoute?.includes("elite")) {
    return "elite";
  }

  if (planId?.includes("base") || productRoute?.includes("base")) {
    return "base";
  }

  if (planId?.includes("free") || productRoute?.includes("free")) {
    return "free";
  }

  return "pro";
}

export function shouldGrantAccessForWhopEvent(eventType: string | null): boolean {
  return eventType === "membership.activated" || eventType === "payment.succeeded";
}

export function shouldRevokeAccessForWhopEvent(eventType: string | null): boolean {
  return eventType === "membership.deactivated";
}