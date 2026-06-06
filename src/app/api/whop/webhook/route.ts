import { NextResponse } from "next/server";
import {
  getWhopCustomerEmail,
  getWhopEventType,
  getWhopProductRoute,
  mapWhopPayloadToPlanCode,
  mapWhopProductToModuleKey,
  shouldGrantAccessForWhopEvent,
  shouldRevokeAccessForWhopEvent,
} from "@/modules/billing/server/whop/whop-mapper";
import {
  grantModuleAccessByEmail,
  revokeModuleAccessByEmail,
} from "@/modules/billing/server/billing-access";

export async function POST(request: Request) {
  const bodyText = await request.text();

  const webhookId = request.headers.get("webhook-id");
  const webhookSignature = request.headers.get("webhook-signature");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { ok: false, error: "missing-webhook-headers" },
      { status: 400 },
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 },
    );
  }

  const eventType = getWhopEventType(payload);
  const email = getWhopCustomerEmail(payload);
  const productRoute = getWhopProductRoute(payload);
  const moduleKey = mapWhopProductToModuleKey(productRoute);
  const planCode = mapWhopPayloadToPlanCode(payload);

  console.log(
    "WHOP WEBHOOK MAPPED",
    JSON.stringify(
      {
        webhookId,
        webhookTimestamp,
        hasSignature: Boolean(webhookSignature),
        eventType,
        email,
        productRoute,
        moduleKey,
        planCode,
      },
      null,
      2,
    ),
  );

  if (!email || !moduleKey) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: "missing-email-or-unmapped-product",
      eventType,
      productRoute,
    });
  }

  if (shouldGrantAccessForWhopEvent(eventType)) {
    await grantModuleAccessByEmail({
      email,
      moduleKey,
      planCode,
      provider: "whop",
    });

    return NextResponse.json({
      ok: true,
      action: "grant",
      email,
      moduleKey,
      planCode,
    });
  }

  if (shouldRevokeAccessForWhopEvent(eventType)) {
    await revokeModuleAccessByEmail({
      email,
      moduleKey,
    });

    return NextResponse.json({
      ok: true,
      action: "revoke",
      email,
      moduleKey,
    });
  }

  return NextResponse.json({
    ok: true,
    ignored: true,
    reason: "unsupported-event",
    eventType,
  });
}