import { NextResponse } from "next/server";
import type { BillingPlanCode } from "@/modules/billing/types/billing.types";
import { applyWhopModuleEvent } from "@/modules/billing/server/billing-access";
import {
  hasWebhookBeenProcessed,
  markWebhookProcessed,
} from "@/modules/billing/server/webhook-events";
import { verifyWhopWebhookSignature } from "@/modules/billing/server/whop/whop-signature";
import { assignRouteProFounder } from "@/modules/routepro/server/routepro-founder";

type JsonObject = Record<string, unknown>;

type RouteProOffer =
  | "founding_driver"
  | "standard";

function isObject(
  value: unknown,
): value is JsonObject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function getString(
  object: JsonObject | null,
  key: string,
): string | null {
  if (!object) return null;

  const value = object[key];

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

function getEventType(
  payload: unknown,
): string | null {
  if (!isObject(payload)) return null;

  return getString(payload, "type");
}

function getEventData(
  payload: unknown,
): JsonObject | null {
  if (!isObject(payload)) return null;

  const data = payload.data;

  return isObject(data) ? data : null;
}

function getMetadata(
  payload: unknown,
): JsonObject | null {
  const data = getEventData(payload);

  if (!data) return null;

  if (isObject(data.metadata)) {
    return data.metadata;
  }

  const membership = isObject(data.membership)
    ? data.membership
    : null;

  if (
    membership &&
    isObject(membership.metadata)
  ) {
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
    const payloadTimestamp = getString(
      payload,
      "timestamp",
    );

    if (payloadTimestamp) {
      const parsed = new Date(payloadTimestamp);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  const timestampSeconds = Number(
    webhookTimestampHeader,
  );

  if (!Number.isFinite(timestampSeconds)) {
    return null;
  }

  const fallbackDate = new Date(
    timestampSeconds * 1000,
  );

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }

  return fallbackDate.toISOString();
}

function getRouteProContext(
  payload: unknown,
): {
  userId: string;
  email: string | null;
  moduleKey: "routepro";
  planCode: BillingPlanCode;
  whopPlanId: string;
  offer: RouteProOffer;
} | null {
  const expectedProductId =
    process.env.WHOP_ROUTEPRO_PRODUCT_ID;

  const founderPlanId =
    process.env.WHOP_ROUTEPRO_PLAN_ID;

  const standardPlanId =
    process.env.WHOP_ROUTEPRO_STANDARD_PLAN_ID;

  if (
    !expectedProductId ||
    !founderPlanId ||
    !standardPlanId
  ) {
    console.error(
      "Missing RoutePro Whop product/plan configuration",
    );

    return null;
  }

  const metadata = getMetadata(payload);

  if (!metadata) return null;

  const userId = getString(
    metadata,
    "ndw_user_id",
  );

  const email = getString(
    metadata,
    "ndw_email",
  );

  const moduleKey = getString(
    metadata,
    "ndw_module_key",
  );

  const planCode = getString(
    metadata,
    "ndw_plan_code",
  );

  const productId = getString(
    metadata,
    "whop_product_id",
  );

  const planId = getString(
    metadata,
    "whop_plan_id",
  );

  if (!userId || !planId) {
    return null;
  }

  if (moduleKey !== "routepro") {
    return null;
  }

  if (productId !== expectedProductId) {
    return null;
  }

  let offer: RouteProOffer;

  if (planId === founderPlanId) {
    offer = "founding_driver";
  } else if (planId === standardPlanId) {
    offer = "standard";
  } else {
    return null;
  }

  const metadataOffer = getString(
    metadata,
    "ndw_offer",
  );

  /*
   * Se il nuovo metadata è presente deve coincidere
   * con il piano autorizzato.
   *
   * Manteniamo compatibilità con vecchi eventi Sandbox
   * creati prima dell'introduzione di ndw_offer.
   */
  if (
    metadataOffer &&
    metadataOffer !== offer
  ) {
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
    whopPlanId: planId,
    offer,
  };
}

function shouldGrant(
  eventType: string | null,
): boolean {
  return (
    eventType === "membership.activated" ||
    eventType === "payment.succeeded"
  );
}

function shouldRevoke(
  eventType: string | null,
): boolean {
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

  if (
    await hasWebhookBeenProcessed(webhookId)
  ) {
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
        hasRouteProContext:
          Boolean(context),
        userId: context?.userId ?? null,
        moduleKey:
          context?.moduleKey ?? null,
        planCode:
          context?.planCode ?? null,
        whopPlanId:
          context?.whopPlanId ?? null,
        offer:
          context?.offer ?? null,
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

  if (
    shouldGrant(eventType) ||
    shouldRevoke(eventType)
  ) {
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
          error:
            "missing-or-invalid-event-timestamp",
        },
        { status: 400 },
      );
    }

    const action = shouldGrant(eventType)
      ? "grant"
      : "revoke";

    const result =
      await applyWhopModuleEvent({
        userId: context.userId,
        moduleKey: context.moduleKey,
        planCode: context.planCode,
        action,
        eventId: webhookId,
        eventType,
        eventAt,
      });

    let founderNumber: number | null = null;

    /*
     * Assegniamo il posto Founder soltanto dopo
     * un vero grant Whop accettato dalla nostra
     * protezione contro gli eventi fuori ordine.
     *
     * La RPC SQL rende l'assegnazione permanente
     * e atomica.
     */
    if (
      action === "grant" &&
      result === "granted" &&
      context.offer === "founding_driver"
    ) {
      const founder =
        await assignRouteProFounder({
          userId: context.userId,
          whopPlanId: context.whopPlanId,
          whopEventId: webhookId,
        });

      founderNumber =
        founder.founderNumber;
    }

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
      offer: context.offer,
      founderNumber,
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
