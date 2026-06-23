import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  normalizeRouteProAiStop,
  type RouteProAiExtractedStop,
} from "@/modules/routepro/server/routepro-ai-normalizer";

export const runtime = "nodejs";

type ExtractedStop = RouteProAiExtractedStop;

const BATCH_SIZE = 5;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function safeParseJson(text: string): {
  stops: ExtractedStop[];
  warnings: string[];
} {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    stops?: ExtractedStop[];
    warnings?: string[];
  };

  return {
    stops: Array.isArray(parsed.stops) ? parsed.stops : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };
}

function normalizeItalianAddress(value: string): string {
  return value
    .replace(/\b20\d{3}\b/g, "")
    .replace(/\s*\/\s*$/g, "")
    .replace(/\s*\/\s*/g, " ")
    .replace(/,\s*(\d+)\s+\1\b/g, " $1")
    .replace(/\b(\d+)\s+\1\b/g, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeStop(stop: ExtractedStop): ExtractedStop {
  return {
    ...stop,
    address: normalizeItalianAddress(stop.address),
    city: stop.city?.trim() || null,
    notes: stop.notes?.trim() || null,
  };
}

function mergeStops(stops: ExtractedStop[]): ExtractedStop[] {
  const byPosition = new Map<number, ExtractedStop>();

  for (const rawStop of stops) {
    const stop = normalizeRouteProAiStop(rawStop);

    if (!Number.isFinite(stop.originalPosition)) continue;

    const existing = byPosition.get(stop.originalPosition);

    if (!existing) {
      byPosition.set(stop.originalPosition, stop);
      continue;
    }

    if (existing.confidence !== "high" && stop.confidence === "high") {
      byPosition.set(stop.originalPosition, stop);
    }
  }

  return Array.from(byPosition.values()).sort(
    (a, b) => a.originalPosition - b.originalPosition,
  );
}

function findMissingStopNumbers(stops: ExtractedStop[]): number[] {
  if (stops.length < 2) return [];

  const numbers = stops.map((stop) => stop.originalPosition);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const existing = new Set(numbers);
  const missing: number[] = [];

  for (let value = min; value <= max; value += 1) {
    if (!existing.has(value)) missing.push(value);
  }

  return missing;
}

function createMissingStopPlaceholder(originalPosition: number): ExtractedStop {
  return {
    originalPosition,
    address: "",
    city: null,
    notes:
      "Stop non letto da AI Vision. Correggere manualmente prima di ottimizzare.",
    confidence: "low",
  };
}

function ensureNoMissingStops(stops: ExtractedStop[]): ExtractedStop[] {
  const missingStopNumbers = findMissingStopNumbers(stops);

  if (missingStopNumbers.length === 0) {
    return stops;
  }

  return [
    ...stops,
    ...missingStopNumbers.map(createMissingStopPlaceholder),
  ].sort((a, b) => a.originalPosition - b.originalPosition);
}

async function extractStopsFromBatch(
  client: OpenAI,
  files: File[],
  batchIndex: number,
): Promise<{
  stops: ExtractedStop[];
  warnings: string[];
}> {
  const prompt = `
You are RoutePro Vision, an extraction engine for Amazon Flex route screenshots.

Task:
Extract every delivery stop visible in these screenshots.

Return ONLY valid JSON.
No markdown.
No explanations.

Schema:
{
  "stops": [
    {
      "originalPosition": number,
      "address": string,
      "city": string | null,
      "notes": string | null,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "warnings": string[]
}

Critical rules:
- Never drop a delivery stop.
- Keep the original Amazon stop number exactly.
- Extract delivery addresses only.
- Ignore pickup / warehouse / "Ritira" rows only when they clearly have no delivery stop number.
- Never exclude a numbered stop if it contains an address. If it looks like pickup/locker/unclear but has a stop number and address, include it with confidence "low" and add a warning.
- Locker or pickup-like numbered rows must be preserved when they may correspond to a driver action in the route.
- RoutePro must preserve the full Amazon stop sequence. A numbered stop is safer as "low confidence" than missing.
- Remove delivery notes from address.
- Put citofono, interno, piano, c/o, presso, scala, recipient name, business name in notes.
- If unsure whether something is a delivery stop, include it with confidence "low".
- Do not invent missing stop numbers.
- Postal codes such as 20833 must not be included in the address field.
- If Amazon shows duplicated civic numbers like "Via Redipuglia, 4 4", return only one civic number.
- If an address line starts without street type but nearby visible text suggests Via/Viale/Piazza, include the full street name.
- This is batch ${batchIndex + 1}. Extract only what is visible in this batch.
`;

  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "high" }
  > = [{ type: "input_text", text: prompt }];

  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const base64Image = bytes.toString("base64");
    const mimeType = file.type || "image/jpeg";

    content.push({
      type: "input_image",
      image_url: `data:${mimeType};base64,${base64Image}`,
      detail: "high",
    });
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content,
      },
    ],
  });

  return safeParseJson(response.output_text);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("screenshot_file")
    .filter((file): file is File => file instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing screenshot_file" },
      { status: 400 },
    );
  }

  const client = new OpenAI({ apiKey });
  const batches = chunkArray(files, BATCH_SIZE);

  try {
    const batchResults = await Promise.all(
  batches.map(async (batch, index) => {
    const result = await extractStopsFromBatch(client, batch, index);

    return {
      ...result,
      batchIndex: index,
      fileCount: batch.length,
      extractedStops: result.stops.length,
      minStop:
        result.stops.length > 0
          ? Math.min(...result.stops.map((stop) => stop.originalPosition))
          : null,
      maxStop:
        result.stops.length > 0
          ? Math.max(...result.stops.map((stop) => stop.originalPosition))
          : null,
      stopNumbers: result.stops
        .map((stop) => stop.originalPosition)
        .sort((a, b) => a - b),
    };
  }),
);

    const allStops = batchResults.flatMap((result) => result.stops);
    const allWarnings = batchResults.flatMap((result) => result.warnings);

    const mergedStops = mergeStops(allStops);

    const missingStopNumbers =
      files.length >= 20 ? findMissingStopNumbers(mergedStops) : [];

    const safeStops =
      files.length >= 20 ? ensureNoMissingStops(mergedStops) : mergedStops;

    const placeholdersCount = safeStops.filter(
      (stop) => stop.address.trim().length === 0,
    ).length;

    return NextResponse.json({
      ok: true,
      text: JSON.stringify(
        {
          stops: safeStops,
          warnings: [
            ...allWarnings,
            ...(missingStopNumbers.length > 0
              ? [
                  `Sono stati creati ${missingStopNumbers.length} placeholder manuali per stop non letti da AI Vision.`,
                ]
              : []),
          ],
          missingStopNumbers,
          stats: {
            screenshots: files.length,
            batches: batches.length,
            batchSize: BATCH_SIZE,
            extractedStops: mergedStops.length,
            totalStopsAfterSafety: safeStops.length,
            placeholders: placeholdersCount,
            missingStops: missingStopNumbers.length,
            canOptimize: placeholdersCount === 0,
            batchDebug: batchResults.map((batch) => ({
  batchIndex: batch.batchIndex,
  fileCount: batch.fileCount,
  extractedStops: batch.extractedStops,
  minStop: batch.minStop,
  maxStop: batch.maxStop,
  stopNumbers: batch.stopNumbers,
})),
          },
        },
        null,
        2,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error";

    console.error("RoutePro OpenAI vision batch error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "OpenAI vision request failed",
        message,
      },
      { status: 500 },
    );
  }
}