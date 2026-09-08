import { WhopClient } from "@whop/sdk";

export type WhopEnvironment = "production" | "sandbox";

const WHOP_SANDBOX_API_URL = "https://sandbox-api.whop.com/api/v1";

let whopClient: WhopClient | null = null;
let currentEnvironment: WhopEnvironment | null = null;

export function getWhopEnvironment(): WhopEnvironment {
  return process.env.WHOP_ENVIRONMENT === "sandbox"
    ? "sandbox"
    : "production";
}

export function getWhopClient(): WhopClient {
  const apiKey = process.env.WHOP_API_KEY;

  if (!apiKey) {
    throw new Error("Missing WHOP_API_KEY");
  }

  const environment = getWhopEnvironment();

  if (!whopClient || currentEnvironment !== environment) {
    whopClient = new WhopClient({
      token: apiKey,
      ...(environment === "sandbox"
        ? {
            baseUrl: WHOP_SANDBOX_API_URL,
          }
        : {}),
    });

    currentEnvironment = environment;
  }

  return whopClient;
}