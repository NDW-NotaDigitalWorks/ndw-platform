/**
 * RoutePro Smart Engine V3
 * Address Intelligence + textual route context.
 *
 * Pure TypeScript module:
 * - no database access
 * - no provider dependency
 * - no hardcoded city or region
 * - safe to introduce before changing the current geocoder
 */

export type RouteProAddressIssue =
  | "empty_address"
  | "missing_street"
  | "missing_house_number"
  | "missing_locality"
  | "ambiguous_house_number";

export type RouteProParsedAddress = {
  raw: string;
  streetType: string | null;
  streetName: string | null;
  houseNumber: string | null;
  houseNumberNormalized: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  normalizedText: string;
  streetKey: string | null;
  localityKey: string | null;
  queryVariants: string[];
  confidence: number;
  issues: RouteProAddressIssue[];
};

export type RouteProAddressContextItem = {
  value: string;
  key: string;
  count: number;
  share: number;
};

export type RouteProTextualRouteContext = {
  totalAddresses: number;
  parsedAddresses: number;
  dominantLocalities: RouteProAddressContextItem[];
  dominantProvinces: RouteProAddressContextItem[];
  dominantPostalCodes: RouteProAddressContextItem[];
  averageAddressConfidence: number;
  unresolvedCount: number;
};

const STREET_TYPE_ALIASES: Record<string, string> = {
  via: "Via",
  v: "Via",
  viale: "Viale",
  vle: "Viale",
  vicolo: "Vicolo",
  vico: "Vicolo",
  piazza: "Piazza",
  pzza: "Piazza",
  pza: "Piazza",
  piazzale: "Piazzale",
  ple: "Piazzale",
  corso: "Corso",
  cso: "Corso",
  strada: "Strada",
  str: "Strada",
  largo: "Largo",
  localita: "Località",
  località: "Località",
  frazione: "Frazione",
  contrada: "Contrada",
  borgo: "Borgo",
};

const COUNTRY_ALIASES = new Set(["it", "ita", "italia", "italy"]);
const LOCALITY_NOISE = new Set(["italia", "italy", "it", "ita"]);

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeRouteProComparableText(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDisplayText(value: string): string {
  return value
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim()
    .replace(/^,+|,+$/g, "")
    .trim();
}

function titleCasePreservingAcronyms(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      if (/^[IVXLCDM]+$/i.test(word) || /^[A-Z]{2,3}$/.test(word)) {
        return word.toUpperCase();
      }
      if (/^\d+[A-Za-z]?$/.test(word)) {
        return word.toUpperCase();
      }
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function normalizeStreetType(value: string): string | null {
  const key = normalizeRouteProComparableText(value).replace(/\s+/g, "");
  return STREET_TYPE_ALIASES[key] ?? null;
}

function splitStreetType(streetPart: string): {
  streetType: string | null;
  remainder: string;
} {
  const clean = cleanDisplayText(streetPart);
  const match = clean.match(
    /^(via|v\.?|viale|v\.?\s*le|vicolo|vico|piazza|p\.?\s*zza|p\.?\s*za|piazzale|p\.?\s*le|corso|c\.?\s*so|strada|str\.?|largo|localit[aà]|frazione|contrada|borgo)\b[\s.]*/i,
  );

  if (!match) {
    return { streetType: null, remainder: clean };
  }

  return {
    streetType: normalizeStreetType(match[1] ?? ""),
    remainder: clean.slice(match[0].length).trim(),
  };
}

function normalizeHouseNumber(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, "")
    .trim();
}

function extractHouseNumber(value: string): {
  houseNumber: string | null;
  remainder: string;
  ambiguous: boolean;
} {
  const clean = cleanDisplayText(value);
  const match = clean.match(
    /(?:^|\s)(\d{1,5}(?:\s*[/\-]\s*(?:\d{1,5}|[A-Za-z]{1,3})|[A-Za-z]{1,3})?)\s*$/i,
  );

  if (!match?.[1]) {
    return { houseNumber: null, remainder: clean, ambiguous: false };
  }

  const houseNumber = cleanDisplayText(match[1]);
  const remainder = clean.slice(0, match.index).trim();

  return {
    houseNumber,
    remainder,
    ambiguous: /^\d{1,5}\s*\/\s*\d{1,5}$/i.test(houseNumber),
  };
}

function extractPostalCode(parts: string[]): {
  postalCode: string | null;
  remaining: string[];
} {
  let postalCode: string | null = null;

  const remaining = parts
    .map((part) => {
      const match = part.match(/\b(\d{5})\b/);
      if (!match?.[1] || postalCode) return part;
      postalCode = match[1];
      return cleanDisplayText(part.replace(match[0], ""));
    })
    .filter(Boolean);

  return { postalCode, remaining };
}

function extractProvince(parts: string[]): {
  province: string | null;
  remaining: string[];
} {
  let province: string | null = null;

  const remaining = parts.filter((part) => {
    const normalized = part.trim().replace(/[()]/g, "");
    if (!province && /^[A-Za-z]{2}$/.test(normalized)) {
      province = normalized.toUpperCase();
      return false;
    }
    return true;
  });

  return { province, remaining };
}

function removeCountry(parts: string[]): string[] {
  return parts.filter(
    (part) => !COUNTRY_ALIASES.has(normalizeRouteProComparableText(part)),
  );
}

function buildStreetKey(
  streetType: string | null,
  streetName: string | null,
): string | null {
  if (!streetName) return null;
  return normalizeRouteProComparableText(
    [streetType, streetName].filter(Boolean).join(" "),
  );
}

function buildLocalityKey(
  locality: string | null,
  city: string | null,
  province: string | null,
): string | null {
  const value = [locality, city, province].filter(Boolean).join(" ");
  return value ? normalizeRouteProComparableText(value) : null;
}

function buildAddressQueryVariants(params: {
  raw: string;
  streetType: string | null;
  streetName: string | null;
  houseNumber: string | null;
  houseNumberNormalized: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
}): string[] {
  const streetWithNumber = [
    params.streetType,
    params.streetName,
    params.houseNumberNormalized ?? params.houseNumber,
  ]
    .filter(Boolean)
    .join(" ");

  const streetWithoutNumber = [params.streetType, params.streetName]
    .filter(Boolean)
    .join(" ");

  const administrativeFull = [
    params.locality,
    params.city,
    params.province,
    params.postalCode,
    params.country,
  ].filter(Boolean);

  const administrativeCity = [
    params.city ?? params.locality,
    params.province,
    params.postalCode,
    params.country,
  ].filter(Boolean);

  const candidates = [
    params.raw,
    [streetWithNumber, ...administrativeFull].filter(Boolean).join(", "),
    [streetWithNumber, ...administrativeCity].filter(Boolean).join(", "),
    [streetWithoutNumber, ...administrativeFull].filter(Boolean).join(", "),
    [streetWithoutNumber, ...administrativeCity].filter(Boolean).join(", "),
  ];

  return Array.from(
    new Set(
      candidates
        .map(cleanDisplayText)
        .filter((value) => value.length > 0),
    ),
  );
}

function calculateAddressConfidence(params: {
  streetName: string | null;
  houseNumber: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  ambiguousHouseNumber: boolean;
}): number {
  let score = 20;
  if (params.streetName) score += 28;
  if (params.houseNumber) score += 18;
  if (params.locality || params.city) score += 22;
  if (params.province) score += 7;
  if (params.postalCode) score += 5;
  if (params.ambiguousHouseNumber) score -= 8;
  return Math.max(0, Math.min(100, score));
}

export function parseRouteProAddress(
  rawAddress: string,
): RouteProParsedAddress {
  const raw = cleanDisplayText(rawAddress);
  const issues: RouteProAddressIssue[] = [];

  if (!raw) {
    return {
      raw,
      streetType: null,
      streetName: null,
      houseNumber: null,
      houseNumberNormalized: null,
      locality: null,
      city: null,
      province: null,
      postalCode: null,
      country: "Italia",
      normalizedText: "",
      streetKey: null,
      localityKey: null,
      queryVariants: [],
      confidence: 0,
      issues: ["empty_address"],
    };
  }

  const commaParts = raw.split(",").map(cleanDisplayText).filter(Boolean);
  const streetPart = commaParts[0] ?? raw;
  let administrativeParts = removeCountry(commaParts.slice(1));

  const postalResult = extractPostalCode(administrativeParts);
  administrativeParts = postalResult.remaining;

  const provinceResult = extractProvince(administrativeParts);
  administrativeParts = provinceResult.remaining;

  const { streetType, remainder } = splitStreetType(streetPart);
  const houseNumberResult = extractHouseNumber(remainder);

  const streetName = houseNumberResult.remainder
    ? titleCasePreservingAcronyms(houseNumberResult.remainder)
    : null;

  const meaningfulAdministrativeParts = administrativeParts.filter(
    (part) => !LOCALITY_NOISE.has(normalizeRouteProComparableText(part)),
  );

  let locality: string | null = null;
  let city: string | null = null;

  if (meaningfulAdministrativeParts.length === 1) {
    city = titleCasePreservingAcronyms(
      meaningfulAdministrativeParts[0] ?? "",
    );
  } else if (meaningfulAdministrativeParts.length >= 2) {
    locality = titleCasePreservingAcronyms(
      meaningfulAdministrativeParts[0] ?? "",
    );
    city = titleCasePreservingAcronyms(
      meaningfulAdministrativeParts[
        meaningfulAdministrativeParts.length - 1
      ] ?? "",
    );
  }

  const houseNumber = houseNumberResult.houseNumber;
  const houseNumberNormalized = houseNumber
    ? normalizeHouseNumber(houseNumber)
    : null;

  if (!streetName) issues.push("missing_street");
  if (!houseNumber) issues.push("missing_house_number");
  if (!locality && !city) issues.push("missing_locality");
  if (houseNumberResult.ambiguous) issues.push("ambiguous_house_number");

  const normalizedText = normalizeRouteProComparableText(
    [
      streetType,
      streetName,
      houseNumberNormalized,
      locality,
      city,
      provinceResult.province,
      postalResult.postalCode,
      "Italia",
    ]
      .filter(Boolean)
      .join(" "),
  );

  const confidence = calculateAddressConfidence({
    streetName,
    houseNumber,
    locality,
    city,
    province: provinceResult.province,
    postalCode: postalResult.postalCode,
    ambiguousHouseNumber: houseNumberResult.ambiguous,
  });

  const queryVariants = buildAddressQueryVariants({
    raw,
    streetType,
    streetName,
    houseNumber,
    houseNumberNormalized,
    locality,
    city,
    province: provinceResult.province,
    postalCode: postalResult.postalCode,
    country: "Italia",
  });

  return {
    raw,
    streetType,
    streetName,
    houseNumber,
    houseNumberNormalized,
    locality,
    city,
    province: provinceResult.province,
    postalCode: postalResult.postalCode,
    country: "Italia",
    normalizedText,
    streetKey: buildStreetKey(streetType, streetName),
    localityKey: buildLocalityKey(
      locality,
      city,
      provinceResult.province,
    ),
    queryVariants,
    confidence,
    issues,
  };
}

function buildFrequencyItems(
  values: Array<string | null>,
  total: number,
  limit: number,
): RouteProAddressContextItem[] {
  const counts = new Map<string, { value: string; count: number }>();

  for (const value of values) {
    if (!value) continue;
    const key = normalizeRouteProComparableText(value);
    if (!key) continue;

    const current = counts.get(key);
    counts.set(key, {
      value: current?.value ?? value,
      count: (current?.count ?? 0) + 1,
    });
  }

  return Array.from(counts.entries())
    .map(([key, entry]) => ({
      key,
      value: entry.value,
      count: entry.count,
      share: total > 0 ? entry.count / total : 0,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value, "it");
    })
    .slice(0, limit);
}

export function buildRouteProTextualContext(
  addresses: string[],
): RouteProTextualRouteContext {
  const parsed = addresses.map(parseRouteProAddress);
  const totalAddresses = addresses.length;

  const parsedAddresses = parsed.filter(
    (address) => address.confidence >= 50,
  ).length;

  const unresolvedCount = parsed.filter(
    (address) =>
      address.issues.includes("empty_address") ||
      address.issues.includes("missing_street") ||
      address.issues.includes("missing_locality"),
  ).length;

  const averageAddressConfidence =
    parsed.length > 0
      ? Math.round(
          parsed.reduce(
            (sum, address) => sum + address.confidence,
            0,
          ) / parsed.length,
        )
      : 0;

  const localityValues = parsed.map(
    (address) => address.city ?? address.locality,
  );

  return {
    totalAddresses,
    parsedAddresses,
    dominantLocalities: buildFrequencyItems(
      localityValues,
      totalAddresses,
      8,
    ),
    dominantProvinces: buildFrequencyItems(
      parsed.map((address) => address.province),
      totalAddresses,
      5,
    ),
    dominantPostalCodes: buildFrequencyItems(
      parsed.map((address) => address.postalCode),
      totalAddresses,
      8,
    ),
    averageAddressConfidence,
    unresolvedCount,
  };
}