export type RouteProAiStopConfidence = "high" | "medium" | "low";

export type RouteProAiExtractedStop = {
  originalPosition: number;
  address: string;
  city: string | null;
  notes: string | null;
  confidence: RouteProAiStopConfidence;
};

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCity(value: string | null): string | null {
  if (!value) return null;

  return normalizeSpaces(value)
    .toLowerCase()
    .split(" ")
    .map((part) =>
      part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
    )
    .join(" ");
}

function normalizeAddress(value: string): string {
  return normalizeSpaces(value)
    .replace(/\b20\d{3}\b/g, "")
    .replace(/\s*\/\s*/g, " ")
    .replace(/,\s*(\d+)\s+\1\b/g, " $1")
    .replace(/\b(\d+)\s+\1\b/g, "$1")
    .replace(/\bnumero\s+/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function moveAddressNoiseToNotes(stop: RouteProAiExtractedStop): RouteProAiExtractedStop {
  const noisePatterns = [
    /\bPiano\s+(terra|rialzato|\d+)\b/gi,
    /\bScala\s+[A-Z]\b/gi,
    /\bInterno\s+\w+\b/gi,
    /\bc\/o\s+.+$/gi,
    /\bpresso\s+.+$/gi,
  ];

  let address = stop.address;
  const extractedNotes: string[] = [];

  for (const pattern of noisePatterns) {
    address = address.replace(pattern, (match) => {
      extractedNotes.push(normalizeSpaces(match));
      return "";
    });
  }

  const existingNotes = stop.notes ? [stop.notes] : [];
  const notes = [...existingNotes, ...extractedNotes]
    .map(normalizeSpaces)
    .filter(Boolean)
    .join(" · ");

  return {
    ...stop,
    address: normalizeAddress(address),
    notes: notes.length > 0 ? notes : null,
  };
}

function improveKnownStreetPrefixes(address: string): string {
  const normalized = normalizeSpaces(address);

  const knownStreetMap: Array<[RegExp, string]> = [
    [/^donizetti\b/i, "Via Donizetti"],
    [/^pascoli\b/i, "Via Giovanni Pascoli"],
    [/^de amicis\b/i, "Via De Amicis"],
  ];

  for (const [pattern, replacement] of knownStreetMap) {
    if (pattern.test(normalized)) {
      return normalized.replace(pattern, replacement);
    }
  }

  return normalized;
}

export function normalizeRouteProAiStop(
  stop: RouteProAiExtractedStop,
): RouteProAiExtractedStop {
  const cleaned = moveAddressNoiseToNotes({
    ...stop,
    address: improveKnownStreetPrefixes(normalizeAddress(stop.address)),
    city: normalizeCity(stop.city),
    notes: stop.notes ? normalizeSpaces(stop.notes) : null,
  });

  return {
    ...cleaned,
    address: normalizeAddress(cleaned.address),
  };
}

export function normalizeRouteProAiStops(
  stops: RouteProAiExtractedStop[],
): RouteProAiExtractedStop[] {
  return stops.map(normalizeRouteProAiStop);
}