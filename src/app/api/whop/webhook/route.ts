import { NextResponse } from "next/server";

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

  console.log(
  "WHOP WEBHOOK RECEIVED",
  JSON.stringify(
    {
      webhookId,
      webhookTimestamp,
      hasSignature: Boolean(webhookSignature),
      eventType:
        typeof payload === "object" && payload !== null && "type" in payload
          ? payload.type
          : null,
      payload,
    },
    null,
    2,
  ),
);

  return NextResponse.json({ ok: true });
}