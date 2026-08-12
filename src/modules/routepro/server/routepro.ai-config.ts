export function getRouteProOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("Missing OPENAI_API_KEY server environment variable.");
  }

  return key;
}

export function getRouteProNdwOrsApiKey(): string {
  const key = process.env.NDW_ORS_API_KEY;

  if (!key) {
    throw new Error("Missing NDW_ORS_API_KEY server environment variable.");
  }

  return key;
}

export function getRouteProNdwMapboxAccessToken(): string {
  const key = process.env.NDW_MAPBOX_ACCESS_TOKEN;

  if (!key) {
    throw new Error(
      "Missing NDW_MAPBOX_ACCESS_TOKEN server environment variable.",
    );
  }

  return key;
}