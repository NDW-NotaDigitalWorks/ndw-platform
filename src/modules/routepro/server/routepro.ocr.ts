import { createClient } from "@/lib/supabase/server";

type GoogleVisionTextAnnotation = {
  description?: string;
};

type GoogleVisionResponse = {
  responses?: Array<{
    textAnnotations?: GoogleVisionTextAnnotation[];
    error?: {
      message?: string;
    };
  }>;
};

export type RouteProOcrResult =
  | {
      ok: true;
      text: string;
      provider: "google_vision";
    }
  | {
      ok: false;
      reason: "missing_key" | "provider_error" | "no_text";
      message: string;
      provider: "google_vision";
    };

async function getMyGoogleVisionKey(): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routepro_api_keys")
    .select("encrypted_key")
    .eq("provider", "google_vision")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("RoutePro Google Vision key fetch error:", error.message);
    return null;
  }

  return data?.encrypted_key ?? null;
}

export async function extractTextFromImageWithGoogleVision(
  file: File,
): Promise<RouteProOcrResult> {
  const apiKey = await getMyGoogleVisionKey();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing_key",
      message: "Missing Google Vision API key.",
      provider: "google_vision",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: "TEXT_DETECTION",
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        reason: "provider_error",
        message: `Google Vision error: ${response.status}`,
        provider: "google_vision",
      };
    }

    const json = (await response.json()) as GoogleVisionResponse;
    const firstResponse = json.responses?.[0];

    if (firstResponse?.error?.message) {
      return {
        ok: false,
        reason: "provider_error",
        message: firstResponse.error.message,
        provider: "google_vision",
      };
    }

    const text = firstResponse?.textAnnotations?.[0]?.description?.trim();

    if (!text) {
      return {
        ok: false,
        reason: "no_text",
        message: "No text detected in image.",
        provider: "google_vision",
      };
    }

    return {
      ok: true,
      text,
      provider: "google_vision",
    };
  } catch (error) {
    console.error("RoutePro Google Vision OCR error:", error);

    return {
      ok: false,
      reason: "provider_error",
      message: "Google Vision OCR request failed.",
      provider: "google_vision",
    };
  }
}