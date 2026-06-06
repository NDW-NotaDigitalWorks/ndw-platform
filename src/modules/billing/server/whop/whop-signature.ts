import crypto from "node:crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyWhopWebhookSignature(params: {
  bodyText: string;
  signatureHeader: string;
  timestampHeader: string;
  webhookId: string;
}) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing WHOP_WEBHOOK_SECRET");
  }

  const [version, signature] = params.signatureHeader.split(",");

  if (version !== "v1" || !signature) {
    return false;
  }

  const timestampSeconds = Number(params.timestampHeader);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const toleranceSeconds = 60 * 5;

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds
  ) {
    return false;
  }

  const signedPayload = `${params.webhookId}.${params.timestampHeader}.${params.bodyText}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  return safeCompare(expectedSignature, signature);
}