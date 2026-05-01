export type RouteProParsedFlexStop = {
  originalPosition: number;
  address: string;
  city: string | null;
  parcels: number | null;
  rawBlock: string;
};

const ADDRESS_STARTERS = [
  "via",
  "viale",
  "piazza",
  "corso",
  "strada",
  "vicolo",
  "largo",
  "piazzale",
  "traversa",
  "contrada",
];

const NOISE_PATTERNS = [
  /^n\.\s*/i,
  /^consegna\s+\d+/i,
  /^posizioni$/i,
  /^fermata corrente$/i,
  /^elenco delle tappe/i,
  /^\d{1,2}:\d{2}/,
];

function cleanLine(line: string): string {
  return line
    .replace(/[•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isStopNumber(line: string): boolean {
  return /^\d{1,3}$/.test(line.trim());
}

function isNoiseLine(line: string): boolean {
  const cleaned = cleanLine(line);

  return NOISE_PATTERNS.some((pattern) => pattern.test(cleaned));
}

function looksLikeAddress(line: string): boolean {
  const lower = cleanLine(line).toLowerCase();

  return ADDRESS_STARTERS.some((starter) => lower.startsWith(`${starter} `));
}

function extractParcels(lines: string[]): number | null {
  for (const line of lines) {
    const match = cleanLine(line).match(/consegna\s+(\d+)/i);

    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return null;
}

function normalizeAddress(value: string): string {
  return cleanLine(value)
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeCity(value: string): string {
  return cleanLine(value).trim();
}

function splitIntoStopBlocks(text: string): Array<{
  originalPosition: number;
  lines: string[];
}> {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0);

  const blocks: Array<{
    originalPosition: number;
    lines: string[];
  }> = [];

  let currentBlock:
    | {
        originalPosition: number;
        lines: string[];
      }
    | null = null;

  for (const line of lines) {
    if (isStopNumber(line)) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        originalPosition: Number(line),
        lines: [],
      };

      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function parseBlock(block: {
  originalPosition: number;
  lines: string[];
}): RouteProParsedFlexStop | null {
  const usefulLines = block.lines
    .map(cleanLine)
    .filter((line) => line.length > 0)
    .filter((line) => !isNoiseLine(line));

  const addressIndex = usefulLines.findIndex(looksLikeAddress);

  if (addressIndex === -1) {
    return null;
  }

  const addressParts: string[] = [];
  let city: string | null = null;

  for (let index = addressIndex; index < usefulLines.length; index += 1) {
    const line = usefulLines[index];

    if (/^consegna\s+\d+/i.test(line)) {
      break;
    }

    if (/^posizioni$/i.test(line)) {
      break;
    }

    if (index > addressIndex) {
      const previousLine = usefulLines[index - 1];

      if (
        !looksLikeAddress(line) &&
        !line.match(/\d/) &&
        previousLine &&
        addressParts.length > 0
      ) {
        city = normalizeCity(line);
        break;
      }
    }

    addressParts.push(line);
  }

  const parcels = extractParcels(block.lines);

  const address = normalizeAddress(addressParts.join(" "));

  if (!address || address.length < 5) {
    return null;
  }

  return {
    originalPosition: block.originalPosition,
    address,
    city,
    parcels,
    rawBlock: block.lines.join("\n"),
  };
}

export function parseAmazonFlexStopsFromOcr(
  text: string,
): RouteProParsedFlexStop[] {
  const blocks = splitIntoStopBlocks(text);

  const parsedStops = blocks
    .map(parseBlock)
    .filter((stop): stop is RouteProParsedFlexStop => Boolean(stop));

  const uniqueByOriginalPosition = new Map<number, RouteProParsedFlexStop>();

  for (const stop of parsedStops) {
    if (!uniqueByOriginalPosition.has(stop.originalPosition)) {
      uniqueByOriginalPosition.set(stop.originalPosition, stop);
    }
  }

  return Array.from(uniqueByOriginalPosition.values()).sort(
    (a, b) => a.originalPosition - b.originalPosition,
  );
}

export function formatParsedFlexStopsForTextarea(
  stops: RouteProParsedFlexStop[],
): string {
  return stops
    .map((stop) => {
      const cityPart = stop.city ? `, ${stop.city}` : "";
      return `${stop.originalPosition} | ${stop.address}${cityPart}`;
    })
    .join("\n");
}