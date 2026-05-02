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
  /^=$/,
  /^\?$/,
  /^o$/i,
  /^く$/,
  /^\|\|\|$/,
  /^elenco delle tappe/i,
  /^fermata corrente$/i,
  /^consegna$/i,
  /^locker$/i,
  /^\d{1,2}:\d{2}/,
];

type RawBlock = {
  originalPosition: number | null;
  lines: string[];
};

function cleanLine(line: string): string {
  return line
    .replace(/[•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoiseLine(line: string): boolean {
  const cleaned = cleanLine(line);
  return NOISE_PATTERNS.some((pattern) => pattern.test(cleaned));
}

function isStandaloneStopNumber(line: string): boolean {
  return /^\d{1,3}$/.test(cleanLine(line));
}

function getStandaloneStopNumber(line: string): number | null {
  if (!isStandaloneStopNumber(line)) {
    return null;
  }

  const value = Number(cleanLine(line));

  if (value < 1 || value > 200) {
    return null;
  }

  return value;
}

function startsDeliveryBlock(line: string): boolean {
  const cleaned = cleanLine(line);
  return /^[o0]?\s*n\.\s*c\d+/i.test(cleaned);
}

function isParcelLine(line: string): boolean {
  return /^consegna\s+\d+\s+pacc/i.test(cleanLine(line));
}

function findAddressStarterIndex(line: string): number {
  const lower = cleanLine(line).toLowerCase();

  for (const starter of ADDRESS_STARTERS) {
    const indexWithSpace = lower.indexOf(`${starter} `);
    if (indexWithSpace >= 0) {
      return indexWithSpace;
    }

    const indexWithComma = lower.indexOf(`${starter},`);
    if (indexWithComma >= 0) {
      return indexWithComma;
    }
  }

  return -1;
}

function looksLikeAddress(line: string): boolean {
  const cleaned = cleanLine(line);
  const lower = cleaned.toLowerCase();

  if (lower.includes("elenco delle tappe")) {
    return false;
  }

  const addressIndex = findAddressStarterIndex(cleaned);
  const hasNumber = /\d/.test(cleaned);

  return addressIndex >= 0 && hasNumber && cleaned.length >= 6;
}

function extractLeadingStopAndText(line: string): {
  stopNumber: number | null;
  rest: string;
} {
  const cleaned = cleanLine(line);
  const match = cleaned.match(/^(\d{1,3})\s+(.+)$/);

  if (!match?.[1] || !match?.[2]) {
    return {
      stopNumber: null,
      rest: cleaned,
    };
  }

  const stopNumber = Number(match[1]);

  if (stopNumber < 1 || stopNumber > 200) {
    return {
      stopNumber: null,
      rest: cleaned,
    };
  }

  return {
    stopNumber,
    rest: match[2].trim(),
  };
}

function extractAddressFromLine(line: string): string {
  const cleaned = cleanLine(line);
  const addressIndex = findAddressStarterIndex(cleaned);

  if (addressIndex === -1) {
    return cleaned;
  }

  return cleaned.slice(addressIndex).trim();
}

function looksLikeCity(line: string): boolean {
  const cleaned = cleanLine(line);

  if (!cleaned || cleaned.length < 3) {
    return false;
  }

  if (/\d/.test(cleaned)) {
    return false;
  }

  if (isNoiseLine(cleaned)) {
    return false;
  }

  if (startsDeliveryBlock(cleaned)) {
    return false;
  }

  if (looksLikeAddress(cleaned)) {
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

  return true;
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

function blockHasAddress(block: RawBlock | null): boolean {
  if (!block) {
    return false;
  }

  return block.lines.some((line) => {
    const { rest } = extractLeadingStopAndText(line);
    return looksLikeAddress(rest);
  });
}

function splitIntoStopBlocks(text: string): RawBlock[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0)
    .filter((line) => !isNoiseLine(line));

  const blocks: RawBlock[] = [];
  const pendingStopNumbers: number[] = [];

  let currentBlock: RawBlock | null = null;

  for (const line of lines) {
    const standaloneNumber = getStandaloneStopNumber(line);

    if (standaloneNumber !== null) {
      if (currentBlock && !blockHasAddress(currentBlock)) {
        currentBlock.originalPosition = standaloneNumber;
        continue;
      }

      if (currentBlock && blockHasAddress(currentBlock)) {
        pendingStopNumbers.push(standaloneNumber);
        continue;
      }

      pendingStopNumbers.push(standaloneNumber);
      continue;
    }

    if (startsDeliveryBlock(line)) {
      if (currentBlock && blockHasAddress(currentBlock)) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        originalPosition: pendingStopNumbers.shift() ?? null,
        lines: [line],
      };

      continue;
    }

    const leading = extractLeadingStopAndText(line);

    if (leading.stopNumber !== null && looksLikeAddress(leading.rest)) {
      if (currentBlock && blockHasAddress(currentBlock)) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        originalPosition: leading.stopNumber,
        lines: [leading.rest],
      };

      pendingStopNumbers.length = 0;
      continue;
    }

    if (!currentBlock) {
      continue;
    }

    currentBlock.lines.push(line);
  }

  if (currentBlock && blockHasAddress(currentBlock)) {
    blocks.push(currentBlock);
  }

  return blocks.filter((block) => block.originalPosition !== null);
}

function parseBlock(block: RawBlock): RouteProParsedFlexStop | null {
  if (block.originalPosition === null) {
    return null;
  }

  const usefulLines = block.lines
    .map(cleanLine)
    .filter((line) => line.length > 0)
    .filter((line) => !isNoiseLine(line));

  const normalizedLines = usefulLines.map((line) => {
    const leading = extractLeadingStopAndText(line);
    return leading.stopNumber !== null ? leading.rest : line;
  });

  const addressIndex = normalizedLines.findIndex(looksLikeAddress);

  if (addressIndex === -1) {
    return null;
  }

  const addressParts: string[] = [
    extractAddressFromLine(normalizedLines[addressIndex]),
  ];

  let city: string | null = null;

  for (let index = addressIndex + 1; index < normalizedLines.length; index += 1) {
    const line = normalizedLines[index];

    if (startsDeliveryBlock(line)) {
      break;
    }

    if (isParcelLine(line)) {
      break;
    }

    if (getStandaloneStopNumber(line) !== null) {
      continue;
    }

    if (looksLikeCity(line)) {
      city = normalizeCity(line);
      break;
    }

    if (looksLikeAddress(line)) {
      addressParts.push(extractAddressFromLine(line));
    }
  }

  const address = normalizeAddress(addressParts.join(" "));
  const parcels = extractParcels(block.lines);

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