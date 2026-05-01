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
];

const NOISE_PATTERNS = [
  /^n\.\s*/i,
  /^c\d+/i,
  /^consegna$/i,
  /^consegna\s+\d+/i,
  /^posizioni$/i,
  /^fermata corrente$/i,
  /^elenco delle tappe/i,
  /^\d{1,2}:\d{2}/,
  /^continua/i,
  /^scansiona/i,
  /^problema/i,
];

function cleanLine(line: string): string {
  return line.replace(/[•|]/g, " ").replace(/\s+/g, " ").trim();
}

function getStopNumberFromLine(line: string): number | null {
  const cleaned = cleanLine(line);
  const match = cleaned.match(/^(\d{1,3})(\s|$)/);
  return match?.[1] ? Number(match[1]) : null;
}

function removeLeadingStopNumber(line: string): string {
  return cleanLine(line).replace(/^\d{1,3}\s+/, "").trim();
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
    if (match?.[1]) return Number(match[1]);
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
  return cleanLine(value);
}

function splitIntoStopBlocks(text: string): Array<{
  originalPosition: number;
  lines: string[];
}> {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0);

  const blocks: Array<{ originalPosition: number; lines: string[] }> = [];
  let currentBlock: { originalPosition: number; lines: string[] } | null = null;

  for (const rawLine of lines) {
    const stopNumber = getStopNumberFromLine(rawLine);

    if (stopNumber !== null) {
      if (currentBlock) blocks.push(currentBlock);

      currentBlock = {
        originalPosition: stopNumber,
        lines: [],
      };

      const remainingText = removeLeadingStopNumber(rawLine);
      if (remainingText.length > 0) {
        currentBlock.lines.push(remainingText);
      }

      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(rawLine);
    }
  }

  if (currentBlock) blocks.push(currentBlock);

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

  if (addressIndex === -1) return null;

  const addressParts: string[] = [];
  let city: string | null = null;

  for (let index = addressIndex; index < usefulLines.length; index += 1) {
    const line = usefulLines[index];

    if (/^consegna\s+\d+/i.test(line)) break;
    if (/^posizioni$/i.test(line)) break;

    if (index > addressIndex && !looksLikeAddress(line)) {
      const looksLikeCity =
        !line.match(/\d/) &&
        line.length >= 3 &&
        !line.toLowerCase().includes("pacco");

      if (looksLikeCity) {
        city = normalizeCity(line);
        break;
      }
    }

    addressParts.push(line);
  }

  const address = normalizeAddress(addressParts.join(" "));
  const parcels = extractParcels(block.lines);

  if (!address || address.length < 5) return null;

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

  const unique = new Map<number, RouteProParsedFlexStop>();

  for (const stop of parsedStops) {
    if (!unique.has(stop.originalPosition)) {
      unique.set(stop.originalPosition, stop);
    }
  }

  return Array.from(unique.values()).sort(
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