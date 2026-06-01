import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromImageWithGoogleVision } from "@/modules/routepro/server/routepro.ocr";
import { parseAmazonFlexStopsFromVisionLayout } from "@/modules/routepro/server/routepro.flex-layout-parser";

export const runtime = "nodejs";

const MAX_FILES = 60;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

type ParsedStop = {
  originalPosition: number;
  address: string;
  city: string | null;
};

type DuplicateStopReport = {
  originalPosition: number;
  keptAddress: string;
  duplicateAddress: string;
};

function buildUniqueStopsWithDuplicateReport(stops: ParsedStop[]): {
  uniqueStops: ParsedStop[];
  duplicateStops: DuplicateStopReport[];
} {
  const unique = new Map<number, ParsedStop>();
  const duplicateStops: DuplicateStopReport[] = [];

  for (const stop of stops) {
    const existing = unique.get(stop.originalPosition);

    if (!existing) {
      unique.set(stop.originalPosition, stop);
      continue;
    }

    duplicateStops.push({
      originalPosition: stop.originalPosition,
      keptAddress: existing.address,
      duplicateAddress: stop.address,
    });
  }

  return {
    uniqueStops: Array.from(unique.values()).sort(
      (a, b) => a.originalPosition - b.originalPosition,
    ),
    duplicateStops,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

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

  if (imageFiles.length > MAX_FILES) {
    return NextResponse.json(
      {
        ok: false,
        error: "too-many-files",
        message: `Puoi caricare massimo ${MAX_FILES} screenshot per import.`,
      },
      { status: 413 },
    );
  }

  const oversizedFile = imageFiles.find(
    (file) => file.size > MAX_FILE_SIZE_BYTES,
  );

  if (oversizedFile) {
    return NextResponse.json(
      {
        ok: false,
        error: "file-too-large",
        message: "Uno o più screenshot superano il limite massimo consentito.",
      },
      { status: 413 },
    );
  }

  const invalidFile = imageFiles.find(
    (file) => !file.type.startsWith("image/"),
  );

  if (invalidFile) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid-file-type",
        message: "Carica solo file immagine.",
      },
      { status: 415 },
    );
  }

  const allParsedStops: ParsedStop[] = [];
  const fallbackTexts: string[] = [];
  const failedFiles: string[] = [];

  for (const file of imageFiles) {
    const result = await extractTextFromImageWithGoogleVision(file);

    if (!result.ok) {
      failedFiles.push(file.name || "unnamed-file");
      continue;
    }

    const stops = parseAmazonFlexStopsFromVisionLayout(result.words);

    if (stops.length > 0) {
      allParsedStops.push(
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

  const { uniqueStops, duplicateStops } =
    buildUniqueStopsWithDuplicateReport(allParsedStops);

  return NextResponse.json({
    ok: true,
    parsedStops: uniqueStops,
    fallbackTexts,
    importReport: {
      totalFiles: imageFiles.length,
      processedFiles: imageFiles.length - failedFiles.length,
      failedFiles,
      extractedStopsBeforeDeduplication: allParsedStops.length,
      extractedStops: uniqueStops.length,
      duplicateStopsIgnored: duplicateStops.length,
      duplicateStops,
    },
  });
}