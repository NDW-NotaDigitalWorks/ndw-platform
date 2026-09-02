import crypto from "node:crypto";

function safeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function decodeWebhookSecret(secret: string): Buffer {
  const trimmedSecret = secret.trim();

  const encodedSecret = trimmedSecret.startsWith("whsec_")
    ? trimmedSecret.slice("whsec_".length)
    : trimmedSecret;

  if (!encodedSecret) {
    throw new Error("Invalid WHOP_WEBHOOK_SECRET");
  }

  return Buffer.from(encodedSecret, "base64");
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

  const timestampSeconds = Number(params.timestampHeader);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const toleranceSeconds = 60 * 5;

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds
  ) {
    return false;
  }

  const signedPayload =
    `${params.webhookId}.${params.timestampHeader}.${params.bodyText}`;

  const secretKey = decodeWebhookSecret(secret);

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signedPayload)
    .digest();

  const signatures = params.signatureHeader.split(" ");

  for (const versionedSignature of signatures) {
    const separatorIndex = versionedSignature.indexOf(",");

    if (separatorIndex === -1) {
      continue;
    }

    const version = versionedSignature.slice(0, separatorIndex);
    const encodedSignature =
      versionedSignature.slice(separatorIndex + 1);

    if (version !== "v1" || !encodedSignature) {
      continue;
    }

    let receivedSignature: Buffer;

    try {
      receivedSignature = Buffer.from(
        encodedSignature,
        "base64",
      );
    } catch {
      continue;
    }

    if (
      safeCompare(
        expectedSignature,
        receivedSignature,
      )
    ) {
      return true;
    }
  }

  return false;
}