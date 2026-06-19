import { getRouteProOpenAiApiKey } from "@/modules/routepro/server/routepro.ai-config";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

type OpenAiVisionStop = {
  originalStopNumber?: number;
  addressRaw?: string;
  city?: string | null;
  confidence?: "high" | "medium" | "low" | "needs_review";
  isPlaceholder?: boolean;
  needsReviewReason?: string | null;
};

type OpenAiVisionPayload = {
  stops?: OpenAiVisionStop[];
};

function normalizeAiStop(stop: OpenAiVisionStop): RouteProAiExtractedStop | null {
  if (!stop.originalStopNumber || stop.originalStopNumber < 1) {
    return null;
  }

  const isPlaceholder = Boolean(stop.isPlaceholder);
  const addressRaw = stop.addressRaw?.trim();

  return {
    originalStopNumber: stop.originalStopNumber,
    addressRaw: addressRaw && addressRaw.length > 0 ? addressRaw : "PLACEHOLDER_STOP_MISSING_ADDRESS",
    city: stop.city?.trim() || null,
    confidence: stop.confidence ?? (isPlaceholder ? "needs_review" : "medium"),
    isPlaceholder,
    needsReviewReason: stop.needsReviewReason ?? null,
  };
}

function extractJsonFromText(text: string): OpenAiVisionPayload {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as OpenAiVisionPayload;
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { stops: [] };
    }

    try {
      return JSON.parse(jsonMatch[0]) as OpenAiVisionPayload;
    } catch {
      return { stops: [] };
    }
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "image/jpeg";

  return `data:${mimeType};base64,${base64}`;
}

export async function extractRouteProStopsWithOpenAiVision(
  files: File[],
): Promise<RouteProAiExtractedStop[]> {
  const apiKey = getRouteProOpenAiApiKey();

  const content: Array<
    | {
        type: "input_text";
        text: string;
      }
    | {
        type: "input_image";
        image_url: string;
      }
  > = [
    {
      type: "input_text",
      text: `
You are RoutePro AI Screenshot Import.

Extract Amazon Flex delivery stops from the uploaded screenshots.

Critical rule:
RoutePro must never lose a stop.

Return ONLY valid JSON with this exact structure:
{
  "stops": [
    {
      "originalStopNumber": 2,
      "addressRaw": "Via Roma 10",
      "city": "Milano",
      "confidence": "high",
      "isPlaceholder": false,
      "needsReviewReason": null
    }
  ]
}

Rules:
- Keep Amazon original stop numbers.
- Stop 1 is usually pickup/loading and must be included if visible.
- If a stop number is visible but address is unreadable, create a placeholder.
- Placeholder addressRaw must be "PLACEHOLDER_STOP_MISSING_ADDRESS".
- Placeholder confidence must be "needs_review".
- Never skip visible stop numbers.
- If the same stop appears in multiple screenshots, return it once.
- Do not invent addresses.
- Use confidence high, medium, low, or needs_review.
      `.trim(),
    },
  ];

  for (const file of files) {
    content.push({
      type: "input_image",
      image_url: await fileToDataUrl(file),
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  model: "gpt-4.1-mini",
  max_output_tokens: 12000,
  input: [
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(`OpenAI Vision request failed: ${detail}`);
  }

  const payload = await response.json();

  const outputText =
    typeof payload.output_text === "string"
      ? payload.output_text
      : Array.isArray(payload.output)
        ? payload.output
            .flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
            .map((item: { text?: string }) => item.text ?? "")
            .join("\n")
        : "";

  const parsed = extractJsonFromText(outputText);

  const stops = (parsed.stops ?? [])
    .map(normalizeAiStop)
    .filter((stop): stop is RouteProAiExtractedStop => stop !== null);

  const deduped = new Map<number, RouteProAiExtractedStop>();

  for (const stop of stops) {
    const existing = deduped.get(stop.originalStopNumber);

    if (!existing) {
      deduped.set(stop.originalStopNumber, stop);
      continue;
    }

    if (existing.isPlaceholder && !stop.isPlaceholder) {
      deduped.set(stop.originalStopNumber, stop);
    }
  }

  return Array.from(deduped.values()).sort(
    (a, b) => a.originalStopNumber - b.originalStopNumber,
  );
}