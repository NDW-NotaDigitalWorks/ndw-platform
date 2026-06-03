export function getBaseUrl(requestUrl?: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  if (requestUrl) {
    return new URL(requestUrl).origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(requestUrl?: string, next = "/app"): string {
  const baseUrl = getBaseUrl(requestUrl);
  const safeNext = getSafeNextPath(next);

  return `${baseUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) {
    return "/app";
  }

  if (!value.startsWith("/")) {
    return "/app";
  }

  if (value.startsWith("//")) {
    return "/app";
  }

  return value;
}