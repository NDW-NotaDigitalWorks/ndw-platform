import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getSecretKey(): Buffer {
  const secret = process.env.ROUTEPRO_KEYS_SECRET;

  if (!secret) {
    throw new Error("Missing ROUTEPRO_KEYS_SECRET environment variable.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptRouteProSecret(value: string): string {
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptRouteProSecret(value: string): string {
  const [ivBase64, authTagBase64, encryptedBase64] = value.split(".");

  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    return value;
  }

  const key = getSecretKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}