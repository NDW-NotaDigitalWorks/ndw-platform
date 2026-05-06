import { NextResponse } from "next/server";
import { extractTextFromImageWithGoogleVision } from "@/modules/routepro/server/routepro.ocr";
import { parseAmazonFlexStopsFromVisionLayout } from "@/modules/routepro/server/routepro.flex-layout-parser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("screenshot_file");

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "missing-files" },
      { status: 400 },
    );
  }

  const parsedStops: {
    originalPosition: number;
    address: string;
    city: string | null;
  }[] = [];

  const fallbackTexts: string[] = [];

  for (const file of imageFiles) {
    const result = await extractTextFromImageWithGoogleVision(file);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.reason,
          message: result.message,
        },
        { status: 400 },
      );
    }

    const stops = parseAmazonFlexStopsFromVisionLayout(result.words);

    if (stops.length > 0) {
      parsedStops.push(
        ...stops.map((stop) => ({
          originalPosition: stop.originalPosition,
          address: stop.address,
          city: stop.city,
        })),
      );
    } else {
      fallbackTexts.push(result.text);
    }
  }

  return NextResponse.json({
    ok: true,
    parsedStops,
    fallbackTexts,
  });
}