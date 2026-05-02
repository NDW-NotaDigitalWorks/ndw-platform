import type { RouteProOcrWord } from "@/modules/routepro/server/routepro.ocr";

export type RouteProLayoutParsedStop = {
  originalPosition: number;
  address: string;
  city: string | null;
  rawLine: string;
};

type OcrLine = {
  text: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xCenter: number;
  yCenter: number;
};

const ADDRESS_WORDS = [
  "via",
  "viale",
  "piazza",
  "corso",
  "strada",
  "vicolo",
  "largo",
  "piazzale",
];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildLinesFromWords(words: RouteProOcrWord[]): OcrLine[] {
  const sortedWords = [...words].sort((a, b) => {
    if (Math.abs(a.yCenter - b.yCenter) > 10) {
      return a.yCenter - b.yCenter;
    }

    return a.xMin - b.xMin;
  });

  const lines: RouteProOcrWord[][] = [];

  for (const word of sortedWords) {
    const existingLine = lines.find((line) => {
      const avgY =
        line.reduce((sum, item) => sum + item.yCenter, 0) / line.length;

      return Math.abs(avgY - word.yCenter) <= 12;
    });

    if (existingLine) {
      existingLine.push(word);
    } else {
      lines.push([word]);
    }
  }

  return lines
    .map((lineWords) => {
      const ordered = [...lineWords].sort((a, b) => a.xMin - b.xMin);
      const text = normalizeText(ordered.map((word) => word.text).join(" "));

      const xMin = Math.min(...ordered.map((word) => word.xMin));
      const xMax = Math.max(...ordered.map((word) => word.xMax));
      const yMin = Math.min(...ordered.map((word) => word.yMin));
      const yMax = Math.max(...ordered.map((word) => word.yMax));

      return {
        text,
        xMin,
        xMax,
        yMin,
        yMax,
        xCenter: (xMin + xMax) / 2,
        yCenter:
          ordered.reduce((sum, word) => sum + word.yCenter, 0) / ordered.length,
      };
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.yCenter - b.yCenter);
}

function extractStopLine(text: string): {
  stopNumber: number;
  addressPart: string;
} | null {
  const cleaned = normalizeText(text);
  const match = cleaned.match(/^(\d{1,3})\s+(.+)$/);

  if (!match?.[1] || !match?.[2]) {
    return null;
  }

  const stopNumber = Number(match[1]);

  if (stopNumber < 1 || stopNumber > 200) {
    return null;
  }

  const addressPart = match[2].trim();

  if (addressPart.length < 4) {
    return null;
  }

  return {
    stopNumber,
    addressPart,
  };
}

function containsAddressWord(text: string): boolean {
  const lower = normalizeText(text).toLowerCase();

  return ADDRESS_WORDS.some(
    (word) =>
      lower.includes(`${word} `) ||
      lower.includes(`${word},`),
  );
}

function cleanAddressText(text: string): string {
  return normalizeText(text)
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function looksLikeCity(text: string): boolean {
  const cleaned = normalizeText(text);

  if (cleaned.length < 3) {
    return false;
  }

  if (/\d/.test(cleaned)) {
    return false;
  }

  const lower = cleaned.toLowerCase();

  if (lower.includes("consegna")) {
    return false;
  }

  if (lower.includes("pacco")) {
    return false;
  }

  if (lower.includes("locker")) {
    return false;
  }

  if (lower.includes("elenco")) {
    return false;
  }

  if (lower.includes("tappe")) {
    return false;
  }

  if (lower.startsWith("n.")) {
    return false;
  }

  if (lower.includes("fermata")) {
    return false;
  }

  return true;
}

function findCityBelow(lines: OcrLine[], stopLine: OcrLine): string | null {
  const candidate = lines.find((line) => {
    const isBelow = line.yCenter > stopLine.yCenter;
    const isClose = line.yCenter - stopLine.yCenter <= 70;
    const isRightArea = line.xMin >= stopLine.xMin + 60;

    return isBelow && isClose && isRightArea && looksLikeCity(line.text);
  });

  return candidate ? normalizeText(candidate.text) : null;
}

export function parseAmazonFlexStopsFromVisionLayout(
  words: RouteProOcrWord[],
): RouteProLayoutParsedStop[] {
  const lines = buildLinesFromWords(words);

  const stops: RouteProLayoutParsedStop[] = [];

  for (const line of lines) {
    const stopLine = extractStopLine(line.text);

    if (!stopLine) {
      continue;
    }

    if (!containsAddressWord(stopLine.addressPart)) {
      continue;
    }

    const city = findCityBelow(lines, line);
    const address = cleanAddressText(stopLine.addressPart);

    stops.push({
      originalPosition: stopLine.stopNumber,
      address,
      city,
      rawLine: line.text,
    });
  }

  const unique = new Map<number, RouteProLayoutParsedStop>();

  for (const stop of stops) {
    if (!unique.has(stop.originalPosition)) {
      unique.set(stop.originalPosition, stop);
    }
  }

  return Array.from(unique.values()).sort(
    (a, b) => a.originalPosition - b.originalPosition,
  );
}

export function formatLayoutParsedStopsForTextarea(
  stops: RouteProLayoutParsedStop[],
): string {
  return stops
    .map((stop) => {
      const cityPart = stop.city ? `, ${stop.city}` : "";
      return `${stop.originalPosition} | ${stop.address}${cityPart}`;
    })
    .join("\n");
}

export function debugVisionLayoutLines(words: RouteProOcrWord[]): string {
  const lines = buildLinesFromWords(words);

  return lines
    .map((line) => {
      return `[y=${Math.round(line.yCenter)} x=${Math.round(
        line.xMin,
      )}-${Math.round(line.xMax)}] ${line.text}`;
    })
    .join("\n");
}