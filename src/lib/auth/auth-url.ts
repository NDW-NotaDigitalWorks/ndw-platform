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

export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) {
    return "/app";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) {
    return "/app";
  }

  if (trimmed.startsWith("//")) {
    return "/app";
  }

  return trimmed;
}

export function getAuthCallbackUrl(
  requestUrl?: string,
  next = "/app",
): string {
  const baseUrl = getBaseUrl(requestUrl);
  const safeNext = getSafeNextPath(next);

  return `${baseUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function getLoginUrl(
  next: string | null | undefined,
  options?: {
    signup?: boolean;
    error?: string;
    signupEmailSent?: boolean;
  },
): string {
  const safeNext = getSafeNextPath(next);
  const params = new URLSearchParams();

  if (options?.signup) {
    params.set("mode", "signup");
  }

  if (options?.error) {
    params.set("error", options.error);
  }

  if (options?.signupEmailSent) {
    params.set("signup-email-sent", "1");
  }

  if (safeNext !== "/app") {
    params.set("next", safeNext);
  }

  const query = params.toString();

  return query ? `/login?${query}` : "/login";
}