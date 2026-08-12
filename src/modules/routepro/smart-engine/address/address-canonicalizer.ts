/**
 * RPSE-003 — RoutePro Address Canonicalizer v1
 *
 * Pure TypeScript module:
 * - no database access
 * - no provider dependency
 * - no React / Next.js dependency
 * - no hardcoded city, province or region
 */

import {
  normalizeRouteProComparableText,
  parseRouteProAddress,
  type RouteProAddressIssue,
  type RouteProParsedAddress,
} from "@/modules/routepro/server/routepro.address-intelligence";

export const ROUTEPRO_ADDRESS_CANONICALIZER_VERSION = "1.1.0";

export type RouteProCanonicalizationRuleSource =
  | "built_in"
  | "route_context"
  | "knowledge_base"
  | "manual";

export type RouteProCanonicalizationEvidence = {
  code:
    | "street_type_normalized"
    | "street_alias_applied"
    | "locality_alias_applied"
    | "province_added"
    | "postal_code_added"
    | "country_added"
    | "house_number_normalized"
    | "route_context_applied";
  source: RouteProCanonicalizationRuleSource;
  before: string | null;
  after: string;
};

export type RouteProCanonicalizerContext = {
  dominantLocality?: string | null;
  dominantProvince?: string | null;
  dominantPostalCode?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
};

export type RouteProCanonicalizerKnowledge = {
  streetAliases?: Readonly<Record<string, string>>;
  localityAliases?: Readonly<Record<string, string>>;
  provinceAliases?: Readonly<Record<string, string>>;
};

export type RouteProCanonicalAddress = {
  version: string;
  raw: string;
  parsed: RouteProParsedAddress;
  streetType: string | null;
  streetName: string | null;
  houseNumber: string | null;
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  countryCode: string;
  countryName: string;
  canonicalStreet: string | null;
  canonicalLocality: string | null;
  canonicalAddress: string;
  normalizedKey: string;
  providerQueries: string[];
  confidence: number;
  requiresReview: boolean;
  issues: RouteProAddressIssue[];
  evidence: RouteProCanonicalizationEvidence[];
};

const DEFAULT_COUNTRY_CODE = "IT";
const DEFAULT_COUNTRY_NAME = "Italia";

const STREET_TYPE_CANONICAL: Readonly<Record<string, string>> = {
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
  frazione: "Frazione",
  contrada: "Contrada",
  borgo: "Borgo",
};

function cleanDisplayText(value: string): string {
  return value
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim()
    .replace(/^,+|,+$/g, "")
    .trim();
}

function normalizeStreetType(value: string | null): string | null {
  if (!value) return null;

  const key = normalizeRouteProComparableText(value).replace(/\s+/g, "");
  return STREET_TYPE_CANONICAL[key] ?? cleanDisplayText(value);
}

function normalizeHouseNumber(value: string | null): string | null {
  if (!value) return null;

  return value
    .toUpperCase()
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, "")
    .trim();
}

function applyExactAlias(
  value: string | null,
  aliases: Readonly<Record<string, string>> | undefined,
): string | null {
  if (!value || !aliases) return value;

  const key = normalizeRouteProComparableText(value);
  const alias = aliases[key];
  return alias ? cleanDisplayText(alias) : value;
}

function buildCanonicalStreet(params: {
  streetType: string | null;
  streetName: string | null;
  houseNumber: string | null;
}): string | null {
  const value = [
    params.streetType,
    params.streetName,
    params.houseNumber,
  ]
    .filter(Boolean)
    .join(" ");

  return value ? cleanDisplayText(value) : null;
}

function buildCanonicalLocality(params: {
  locality: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
}): string | null {
  const localityAndCity = [params.locality, params.city]
    .filter(Boolean)
    .join(", ");

  const administrativeSuffix = [
    params.province,
    params.postalCode,
  ]
    .filter(Boolean)
    .join(" ");

  const value = [localityAndCity, administrativeSuffix]
    .filter(Boolean)
    .join(", ");

  return value ? cleanDisplayText(value) : null;
}

function addUniqueQuery(target: string[], value: string): void {
  const clean = cleanDisplayText(value);
  if (!clean) return;

  const key = normalizeRouteProComparableText(clean);

  if (
    target.some(
      (current) =>
        normalizeRouteProComparableText(current) === key,
    )
  ) {
    return;
  }

  target.push(clean);
}


/**
 * RPSE-015A — Progressive street identity.
 *
 * Provider search may safely become less literal when the complete
 * odonym is not how the provider indexes the street. Acceptance remains
 * the responsibility of the Candidate Quality Gate.
 *
 * Example:
 *   "Via Ruggero Leoncavallo" -> "Via Leoncavallo"
 *
 * We deliberately keep the street type and the last significant part of
 * a multi-token street name. Single-token street names are left unchanged.
 */
function buildProgressiveStreetVariants(params: {
  streetType: string | null;
  streetName: string | null;
  houseNumber: string | null;
}): string[] {
  if (!params.streetName) return [];

  const streetName = cleanDisplayText(params.streetName);
  const tokens = streetName.split(/\s+/).filter(Boolean);

  // A one-token odonym is already in its essential form.
  if (tokens.length < 2) return [];

  const leadingParticles = new Set([
    "de",
    "del",
    "della",
    "delle",
    "dei",
    "degli",
    "di",
    "da",
    "dal",
    "dalla",
    "dalle",
    "san",
    "santa",
    "santo",
  ]);

  let start = tokens.length - 1;

  // Preserve a meaningful particle immediately preceding the final token,
  // e.g. "De Gasperi" instead of only "Gasperi".
  if (
    start > 0 &&
    leadingParticles.has(normalizeRouteProComparableText(tokens[start - 1]))
  ) {
    start -= 1;
  }

  const essentialName = tokens.slice(start).join(" ");

  if (
    normalizeRouteProComparableText(essentialName) ===
    normalizeRouteProComparableText(streetName)
  ) {
    return [];
  }

  const variants: string[] = [];

  const withNumber = [
    params.streetType,
    essentialName,
    params.houseNumber,
  ]
    .filter(Boolean)
    .join(" ");

  if (withNumber) variants.push(cleanDisplayText(withNumber));

  return variants;
}

function buildProviderQueries(params: {
  raw: string;
  canonicalStreet: string | null;
  streetWithoutNumber: string | null;
  progressiveStreetVariants: string[];
  canonicalLocality: string | null;
  city: string | null;
  locality: string | null;
  province: string | null;
  postalCode: string | null;
  countryName: string;
}): string[] {
  const queries: string[] = [];

  if (params.canonicalStreet && params.canonicalLocality) {
    addUniqueQuery(
      queries,
      `${params.canonicalStreet}, ${params.canonicalLocality}, ${params.countryName}`,
    );
  }

  if (params.canonicalStreet && params.city) {
    addUniqueQuery(
      queries,
      [
        params.canonicalStreet,
        params.city,
        params.province,
        params.postalCode,
        params.countryName,
      ]
        .filter(Boolean)
        .join(", "),
    );
  }

  if (params.canonicalStreet && params.locality) {
    addUniqueQuery(
      queries,
      [
        params.canonicalStreet,
        params.locality,
        params.province,
        params.countryName,
      ]
        .filter(Boolean)
        .join(", "),
    );
  }

  for (const progressiveStreet of params.progressiveStreetVariants) {
    if (params.canonicalLocality) {
      addUniqueQuery(
        queries,
        `${progressiveStreet}, ${params.canonicalLocality}, ${params.countryName}`,
      );
    }

    if (params.city) {
      addUniqueQuery(
        queries,
        [
          progressiveStreet,
          params.city,
          params.province,
          params.postalCode,
          params.countryName,
        ]
          .filter(Boolean)
          .join(", "),
      );
    }

    if (params.locality) {
      addUniqueQuery(
        queries,
        [
          progressiveStreet,
          params.locality,
          params.province,
          params.countryName,
        ]
          .filter(Boolean)
          .join(", "),
      );
    }
  }

  if (params.streetWithoutNumber && params.canonicalLocality) {
    addUniqueQuery(
      queries,
      `${params.streetWithoutNumber}, ${params.canonicalLocality}, ${params.countryName}`,
    );
  }

  addUniqueQuery(queries, `${params.raw}, ${params.countryName}`);

  return queries;
}

function calculateCanonicalConfidence(params: {
  parsedConfidence: number;
  canonicalStreet: string | null;
  canonicalLocality: string | null;
  houseNumber: string | null;
  province: string | null;
  postalCode: string | null;
  contextApplied: boolean;
  issues: RouteProAddressIssue[];
}): number {
  let score = params.parsedConfidence * 0.65;

  if (params.canonicalStreet) score += 12;
  if (params.canonicalLocality) score += 12;
  if (params.houseNumber) score += 5;
  if (params.province) score += 3;
  if (params.postalCode) score += 2;
  if (params.contextApplied) score += 4;

  if (params.issues.includes("missing_street")) score -= 25;
  if (params.issues.includes("missing_locality")) score -= 20;
  if (params.issues.includes("ambiguous_house_number")) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function canonicalizeRouteProAddress(
  rawAddress: string,
  options: {
    context?: RouteProCanonicalizerContext;
    knowledge?: RouteProCanonicalizerKnowledge;
  } = {},
): RouteProCanonicalAddress {
  const parsed = parseRouteProAddress(rawAddress);
  const context = options.context ?? {};
  const knowledge = options.knowledge ?? {};
  const evidence: RouteProCanonicalizationEvidence[] = [];

  const normalizedStreetType = normalizeStreetType(parsed.streetType);

  if (
    normalizedStreetType &&
    normalizedStreetType !== parsed.streetType
  ) {
    evidence.push({
      code: "street_type_normalized",
      source: "built_in",
      before: parsed.streetType,
      after: normalizedStreetType,
    });
  }

  const rawStreetWithoutNumber = [
    normalizedStreetType,
    parsed.streetName,
  ]
    .filter(Boolean)
    .join(" ");

  const aliasedStreet = applyExactAlias(
    rawStreetWithoutNumber || null,
    knowledge.streetAliases,
  );

  if (
    aliasedStreet &&
    normalizeRouteProComparableText(aliasedStreet) !==
      normalizeRouteProComparableText(rawStreetWithoutNumber)
  ) {
    evidence.push({
      code: "street_alias_applied",
      source: "knowledge_base",
      before: rawStreetWithoutNumber || null,
      after: aliasedStreet,
    });
  }

  const houseNumber = normalizeHouseNumber(
    parsed.houseNumberNormalized ?? parsed.houseNumber,
  );

  if (houseNumber && houseNumber !== parsed.houseNumber) {
    evidence.push({
      code: "house_number_normalized",
      source: "built_in",
      before: parsed.houseNumber,
      after: houseNumber,
    });
  }

  let locality = applyExactAlias(
    parsed.locality,
    knowledge.localityAliases,
  );

  let city = applyExactAlias(
    parsed.city,
    knowledge.localityAliases,
  );

  if (
    locality &&
    parsed.locality &&
    normalizeRouteProComparableText(locality) !==
      normalizeRouteProComparableText(parsed.locality)
  ) {
    evidence.push({
      code: "locality_alias_applied",
      source: "knowledge_base",
      before: parsed.locality,
      after: locality,
    });
  }

  if (
    city &&
    parsed.city &&
    normalizeRouteProComparableText(city) !==
      normalizeRouteProComparableText(parsed.city)
  ) {
    evidence.push({
      code: "locality_alias_applied",
      source: "knowledge_base",
      before: parsed.city,
      after: city,
    });
  }

  let contextApplied = false;

  if (!locality && !city && context.dominantLocality) {
    city = cleanDisplayText(context.dominantLocality);
    contextApplied = true;

    evidence.push({
      code: "route_context_applied",
      source: "route_context",
      before: null,
      after: city,
    });
  }

  let province = applyExactAlias(
    parsed.province,
    knowledge.provinceAliases,
  );

  if (!province && context.dominantProvince) {
    province = cleanDisplayText(
      context.dominantProvince,
    ).toUpperCase();

    contextApplied = true;

    evidence.push({
      code: "province_added",
      source: "route_context",
      before: null,
      after: province,
    });
  }

  const postalCode =
    parsed.postalCode ??
    context.dominantPostalCode?.trim() ??
    null;

  if (!parsed.postalCode && postalCode) {
    evidence.push({
      code: "postal_code_added",
      source: "route_context",
      before: null,
      after: postalCode,
    });
  }

  const countryCode =
    context.countryCode?.trim().toUpperCase() ||
    DEFAULT_COUNTRY_CODE;

  const countryName =
    cleanDisplayText(context.countryName ?? "") ||
    DEFAULT_COUNTRY_NAME;

  evidence.push({
    code: "country_added",
    source: context.countryName
      ? "route_context"
      : "built_in",
    before: null,
    after: countryName,
  });

  const canonicalStreet = buildCanonicalStreet({
    streetType: null,
    streetName: aliasedStreet || null,
    houseNumber,
  });

  const streetWithoutNumber =
    aliasedStreet || rawStreetWithoutNumber || null;

  const progressiveStreetVariants = buildProgressiveStreetVariants({
    streetType: normalizedStreetType,
    streetName: parsed.streetName,
    houseNumber,
  });

  const canonicalLocality = buildCanonicalLocality({
    locality,
    city,
    province,
    postalCode,
  });

  const canonicalAddress = cleanDisplayText(
    [
      canonicalStreet,
      canonicalLocality,
      countryName,
    ]
      .filter(Boolean)
      .join(", "),
  );

  const normalizedKey =
    normalizeRouteProComparableText(canonicalAddress);

  const confidence = calculateCanonicalConfidence({
    parsedConfidence: parsed.confidence,
    canonicalStreet,
    canonicalLocality,
    houseNumber,
    province,
    postalCode,
    contextApplied,
    issues: parsed.issues,
  });

  const requiresReview =
    confidence < 70 ||
    parsed.issues.includes("empty_address") ||
    parsed.issues.includes("missing_street") ||
    parsed.issues.includes("missing_locality");

  return {
    version: ROUTEPRO_ADDRESS_CANONICALIZER_VERSION,
    raw: parsed.raw,
    parsed,
    streetType: normalizedStreetType,
    streetName: aliasedStreet || parsed.streetName,
    houseNumber,
    locality,
    city,
    province,
    postalCode,
    countryCode,
    countryName,
    canonicalStreet,
    canonicalLocality,
    canonicalAddress,
    normalizedKey,
    providerQueries: buildProviderQueries({
      raw: parsed.raw,
      canonicalStreet,
      streetWithoutNumber,
      progressiveStreetVariants,
      canonicalLocality,
      city,
      locality,
      province,
      postalCode,
      countryName,
    }),
    confidence,
    requiresReview,
    issues: parsed.issues,
    evidence,
  };
}