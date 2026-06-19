import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("screenshot_file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing screenshot_file" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64Image = bytes.toString("base64");
  const mimeType = file.type || "image/jpeg";

  const client = new OpenAI({ apiKey });

  const prompt = `
You are RoutePro Vision, an extraction engine for Amazon Flex route screenshots.

Task:
Extract delivery stops visible in this screenshot.

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

Rules:
- Keep the original Amazon stop number.
- Extract delivery addresses only.
- Ignore pickup / warehouse / "Ritira" rows.
- Remove delivery notes from address.
- Put citofono, interno, piano, c/o, presso, scala, business name in notes.
- Do not invent missing stop numbers.
- If a line is unclear, include it with confidence "low".
`;

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64Image}`,
              detail: "high",
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      text: response.output_text,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error";

    console.error("RoutePro OpenAI vision test error:", error);

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