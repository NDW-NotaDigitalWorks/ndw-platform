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

function cleanAiAddress(address: string): string {
  return address
    .replace(/\b\d{5}\b/g, "")
    .replace(/\b(c\/o|presso|citofono|campanello|interno|scala|piano|porta|bar|ufficio|reception|magazzino|srl|sas|spa)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function normalizeAiConfidence(stop: OpenAiVisionStop, cleanedAddress: string) {
  if (stop.isPlaceholder || cleanedAddress.length === 0) return "needs_review";
  if (stop.confidence === "low" || stop.confidence === "needs_review") return stop.confidence;
  return "high";
}

function normalizeAiStop(stop: OpenAiVisionStop): RouteProAiExtractedStop | null {
  if (!stop.originalStopNumber || stop.originalStopNumber < 1) {
    return null;
  }

  const isPlaceholder = Boolean(stop.isPlaceholder);
  const addressRaw = cleanAiAddress(stop.addressRaw?.trim() ?? "");

  return {
    originalStopNumber: stop.originalStopNumber,
    addressRaw: addressRaw && addressRaw.length > 0 ? addressRaw : "PLACEHOLDER_STOP_MISSING_ADDRESS",
    city: stop.city?.trim() || null,
    confidence: normalizeAiConfidence(stop, addressRaw),
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
NDW-ROUTEPRO-AI-01 — AI Screenshot Extraction Engine

You are RoutePro AI Screenshot Import.

Your task:
Extract delivery stops from uploaded route screenshots with maximum accuracy.

RoutePro is a global delivery workflow system.
Do NOT assume the screenshots are only Amazon Flex.
The screenshots may come from Amazon Flex, DSP tools, courier apps, local logistics tools or other multi-stop delivery apps.

CRITICAL RULES:
- RoutePro must never lose a visible stop.
- Every visible stop number must be returned.
- If a stop number is visible but the address is unreadable, create a placeholder.
- Never invent addresses, cities or stop numbers.
- Return each original stop number only once.
- If the same stop appears in multiple screenshots, merge it and keep the clearest version.
- The original stop number must always be preserved.

OUTPUT:
Return ONLY valid JSON.
No markdown.
No explanation.
No comments.
No trailing text.

Exact JSON structure:
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

FIELD RULES:

originalStopNumber:
- Must be the original stop number visible in the courier app.
- Must be a positive integer.
- Do not renumber stops.
- Do not use optimized order.
- Do not infer missing numbers unless a stop number is clearly visible.
- If stop number 1 is visible, include it.

addressRaw:
- Must contain ONLY the deliverable street address.
- Include street name, civic number, building/letter if clearly part of the address.
- Examples:
  - "Via Roma 10"
  - "Via Nino Bixio 17A"
  - "Viale Rimembranze 2"
  - "Via Donizetti 33"
- Do NOT include recipient names.
- Do NOT include company names.
- Do NOT include notes.
- Do NOT include c/o, presso, citofono, interno, scala, piano, porta, campanello, negozio, bar, ufficio, reparto.
- Do NOT include delivery instructions.
- Do NOT include phone numbers.
- Do NOT include parcel counts.
- Do NOT include time windows.
- Do NOT include text that is clearly not part of the street address.
- If the screenshot shows "Via Verdi 10 c/o Rossi", addressRaw must be "Via Verdi 10".
- If the screenshot shows "Via Rimembranze 2 Piano terra", addressRaw must be "Via Rimembranze 2".
- If the screenshot shows "Via Filippo Corridoni 17 Bar", addressRaw must be "Via Filippo Corridoni 17".

city:
- Must contain only the municipality/city/locality if visible or clearly attached to the address.
- Examples:
  - "Giussano"
  - "Milano"
  - "Besana in Brianza"
- Do not put province, notes or country in city.
- If city is not visible, use null.
- If the address line contains postal code + city, extract only the city.
- Example: "20833 GIUSSANO" -> city: "Giussano".

confidence:
Use:
- "high" when stop number, address and city are clearly readable and clean.
- "medium" when address is readable but city or civic number may need light review.
- "low" when address is partially readable but probably recoverable.
- "needs_review" when the stop must be checked manually.

isPlaceholder:
- true only when the stop number is visible but the address cannot be reliably read.
- Placeholder addressRaw must be exactly "PLACEHOLDER_STOP_MISSING_ADDRESS".
- Placeholder confidence must be "needs_review".

needsReviewReason:
- null for clean high-confidence stops.
- Use short Italian reasons when needed:
  - "Comune non visibile"
  - "Numero civico dubbio"
  - "Indirizzo parziale"
  - "Indirizzo mancante"
  - "Testo non leggibile"
  - "Possibile nota dentro indirizzo"

ITALIAN ADDRESS CLEANING RULES:
- Normalize obvious casing.
- Keep accents only if visible.
- Keep civic letters attached to civic number:
  - "17a" -> "17A"
  - "2b" -> "2B"
- Do not change the street name meaning.
- Do not invent "Via", "Viale", "Piazza" if not visible.
- Remove duplicated city when present inside addressRaw.
- Remove postal code from addressRaw if city is extracted.

NOTES / RECIPIENT / BUSINESS TEXT:
Text like the following must NOT be included in addressRaw:
- c/o
- presso
- attenzione
- citofono
- campanello
- interno
- scala
- piano
- porta
- portineria
- negozio
- bar
- ufficio
- azienda
- società
- sas
- srl
- spa
- reception
- magazzino
- lasciare
- consegnare
- chiamare
- telefono

If such text appears but the address is still clear:
- remove it from addressRaw
- keep confidence "high" or "medium" depending on clarity
- do NOT create placeholder

MISSING / PARTIAL STOPS:
- If stop number is visible and address is missing/unreadable:
  {
    "originalStopNumber": N,
    "addressRaw": "PLACEHOLDER_STOP_MISSING_ADDRESS",
    "city": null,
    "confidence": "needs_review",
    "isPlaceholder": true,
    "needsReviewReason": "Indirizzo mancante"
  }

BATCH AWARENESS:
- The uploaded images are only one batch of a larger upload.
- Do not assume the first stop in this batch is stop 1.
- Do not assume the last stop in this batch is the final route stop.
- Extract only what is visible in the provided images.
- Return all visible stops in this batch.
- If stop numbers overlap across screenshots, deduplicate by originalStopNumber.

QUALITY TARGET:
- Clean stops should be "high".
- Do not mark a stop as needs_review just because there are delivery notes.
- If address and city are clear after removing notes, keep it high.
- Only mark needs_review when the actual deliverable address is uncertain.

FINAL CHECK BEFORE ANSWERING:
- JSON only.
- No markdown.
- All visible stop numbers included.
- No duplicate originalStopNumber.
- No recipient names or notes inside addressRaw.
- No invented addresses.
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
  temperature: 0,
  top_p: 1,
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