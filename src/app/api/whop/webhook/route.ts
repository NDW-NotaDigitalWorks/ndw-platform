import { NextResponse } from "next/server";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";
import { applyWhopModuleEvent } from "@/modules/billing/server/billing-access";
import {
  hasWebhookBeenProcessed,
  markWebhookProcessed,
} from "@/modules/billing/server/webhook-events";
import { verifyWhopWebhookSignature } from "@/modules/billing/server/whop/whop-signature";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(object: JsonObject | null, key: string): string | null {
  if (!object) return null;

  const value = object[key];

  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function getEventType(payload: unknown): string | null {
  if (!isObject(payload)) return null;

  return getString(payload, "type");
}

function getEventData(payload: unknown): JsonObject | null {
  if (!isObject(payload)) return null;

  const data = payload.data;

  return isObject(data) ? data : null;
}

function getMetadata(payload: unknown): JsonObject | null {
  const data = getEventData(payload);

  if (!data) return null;

  if (isObject(data.metadata)) {
    return data.metadata;
  }

  const membership = isObject(data.membership)
    ? data.membership
    : null;

  if (membership && isObject(membership.metadata)) {
    return membership.metadata;
  }

  const payment = isObject(data.payment)
    ? data.payment
    : null;

  if (payment && isObject(payment.metadata)) {
    return payment.metadata;
  }

  return null;
}

function getEventTimestamp(
  payload: unknown,
  webhookTimestampHeader: string,
): string | null {
  if (isObject(payload)) {
    const payloadTimestamp = getString(payload, "timestamp");

    if (payloadTimestamp) {
      const parsed = new Date(payloadTimestamp);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  /*
   * Fallback difensivo: Standard Webhooks invia il timestamp
   * dell'invio nell'header webhook-timestamp.
   *
   * Normalmente Whop include già payload.timestamp e sarà quello
   * usato per determinare l'ordine reale degli eventi.
   */
  const timestampSeconds = Number(webhookTimestampHeader);

  if (!Number.isFinite(timestampSeconds)) {
    return null;
  }

  const fallbackDate = new Date(timestampSeconds * 1000);

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }

  return fallbackDate.toISOString();
}

function getRouteProContext(payload: unknown): {
  userId: string;
  email: string | null;
  moduleKey: "routepro";
  planCode: BillingPlanCode;
} | null {
  const expectedProductId =
    process.env.WHOP_ROUTEPRO_PRODUCT_ID;

  const expectedPlanId =
    process.env.WHOP_ROUTEPRO_PLAN_ID;

  if (!expectedProductId || !expectedPlanId) {
    console.error(
      "Missing RoutePro Whop product/plan configuration",
    );

    return null;
  }

  const metadata = getMetadata(payload);

  if (!metadata) return null;

  const userId = getString(metadata, "ndw_user_id");
  const email = getString(metadata, "ndw_email");
  const moduleKey = getString(metadata, "ndw_module_key");
  const planCode = getString(metadata, "ndw_plan_code");

  const productId = getString(
    metadata,
    "whop_product_id",
  );

  const planId = getString(
    metadata,
    "whop_plan_id",
  );

  if (!userId) return null;

  if (moduleKey !== "routepro") {
    return null;
  }

  if (productId !== expectedProductId) {
    return null;
  }

  if (planId !== expectedPlanId) {
    return null;
  }

  const allowedPlans: BillingPlanCode[] = [
    "free",
    "base",
    "pro",
    "elite",
  ];

  const safePlanCode = allowedPlans.includes(
    planCode as BillingPlanCode,
  )
    ? (planCode as BillingPlanCode)
    : "pro";

  return {
    userId,
    email,
    moduleKey: "routepro",
    planCode: safePlanCode,
  };
}

function shouldGrant(eventType: string | null): boolean {
  return (
    eventType === "membership.activated" ||
    eventType === "payment.succeeded"
  );
}

function shouldRevoke(eventType: string | null): boolean {
  return eventType === "membership.deactivated";
}

export async function POST(request: Request) {
  const bodyText = await request.text();

  const webhookId =
    request.headers.get("webhook-id");

  const webhookSignature =
    request.headers.get("webhook-signature");

  const webhookTimestamp =
    request.headers.get("webhook-timestamp");

  if (
    !webhookId ||
    !webhookSignature ||
    !webhookTimestamp
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing-webhook-headers",
      },
      { status: 400 },
    );
  }

  const isValidSignature =
    verifyWhopWebhookSignature({
      bodyText,
      signatureHeader: webhookSignature,
      timestampHeader: webhookTimestamp,
      webhookId,
    });

  if (!isValidSignature) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid-signature",
      },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid-json",
      },
      { status: 400 },
    );
  }

  const eventType = getEventType(payload);

  if (await hasWebhookBeenProcessed(webhookId)) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: "duplicate-event",
      webhookId,
    });
  }

  const context = getRouteProContext(payload);

  console.log(
    "WHOP ROUTEPRO WEBHOOK",
    JSON.stringify(
      {
        webhookId,
        eventType,
        hasRouteProContext: Boolean(context),
        userId: context?.userId ?? null,
        moduleKey: context?.moduleKey ?? null,
        planCode: context?.planCode ?? null,
      },
      null,
      2,
    ),
  );

  if (!context) {
    await markWebhookProcessed({
      webhookId,
      provider: "whop",
      eventType,
    });

    return NextResponse.json({
      ok: true,
      ignored: true,
      reason:
        "missing-or-invalid-routepro-metadata",
      eventType,
    });
  }

  if (shouldGrant(eventType) || shouldRevoke(eventType)) {
    if (!eventType) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing-event-type",
        },
        { status: 400 },
      );
    }

    const eventAt = getEventTimestamp(
      payload,
      webhookTimestamp,
    );

    if (!eventAt) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing-or-invalid-event-timestamp",
        },
        { status: 400 },
      );
    }

    const action = shouldGrant(eventType)
      ? "grant"
      : "revoke";

    const result = await applyWhopModuleEvent({
      userId: context.userId,
      moduleKey: context.moduleKey,
      planCode: context.planCode,
      action,
      eventId: webhookId,
      eventType,
      eventAt,
    });

    await markWebhookProcessed({
      webhookId,
      provider: "whop",
      eventType,
    });

    return NextResponse.json({
      ok: true,
      action,
      result,
      userId: context.userId,
      moduleKey: context.moduleKey,
      planCode: context.planCode,
      eventAt,
    });
  }

  await markWebhookProcessed({
    webhookId,
    provider: "whop",
    eventType,
  });

  return NextResponse.json({
    ok: true,
    ignored: true,
    reason: "unsupported-event",
    eventType,
  });
}
