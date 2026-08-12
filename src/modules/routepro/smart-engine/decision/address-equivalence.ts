/**
 * RPSE-008 — Address Equivalence Engine v1
 *
 * Normalizes common real-world address variants before candidate scoring:
 * - Roman numerals and Italian number words used in street names
 * - House-number suffixes such as 22/E versus 22
 * - Italian province codes versus full province names
 *
 * Pure TypeScript. No framework, database or provider dependency.
 */

import { normalizeRouteProComparableText } from "@/modules/routepro/server/routepro.address-intelligence";

export const ROUTEPRO_ADDRESS_EQUIVALENCE_VERSION = "1.4.4";

export type RouteProHouseNumberMatch =
  | "exact"
  | "base_match"
  | "missing"
  | "mismatch";

const ITALIAN_NUMBER_WORDS: Readonly<Record<string, string>> = {
  uno: "1",
  due: "2",
  tre: "3",
  quattro: "4",
  cinque: "5",
  sei: "6",
  sette: "7",
  otto: "8",
  nove: "9",
  dieci: "10",
  undici: "11",
  dodici: "12",
  tredici: "13",
  quattordici: "14",
  quindici: "15",
  sedici: "16",
  diciassette: "17",
  diciotto: "18",
  diciannove: "19",
  venti: "20",
  ventuno: "21",
  ventidue: "22",
  ventitre: "23",
  ventiquattro: "24",
  venticinque: "25",
  ventisei: "26",
  ventisette: "27",
  ventotto: "28",
  ventinove: "29",
  trenta: "30",
  trentuno: "31",
};

const ITALIAN_ORDINAL_NUMBER_WORDS: Readonly<Record<string, string>> = {
  primo: "1",
  secondo: "2",
  terzo: "3",
  quarto: "4",
  quinto: "5",
  sesto: "6",
  settimo: "7",
  ottavo: "8",
  nono: "9",
  decimo: "10",
  undicesimo: "11",
  dodicesimo: "12",
  tredicesimo: "13",
  quattordicesimo: "14",
  quindicesimo: "15",
  sedicesimo: "16",
  diciassettesimo: "17",
  diciottesimo: "18",
  diciannovesimo: "19",
  ventesimo: "20",
  ventunesimo: "21",
  ventiduesimo: "22",
  ventitreesimo: "23",
  ventiquattresimo: "24",
  venticinquesimo: "25",
  ventiseiesimo: "26",
  ventisettesimo: "27",
  ventottesimo: "28",
  ventinovesimo: "29",
  trentesimo: "30",
  trentunesimo: "31",
};

const ROMAN_VALUES: Readonly<Record<string, number>> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const ITALIAN_PROVINCES: Readonly<Record<string, readonly string[]>> = {
  AG: ["agrigento"],
  AL: ["alessandria"],
  AN: ["ancona"],
  AO: ["aosta", "valle d aosta"],
  AP: ["ascoli piceno"],
  AQ: ["l aquila", "aquila"],
  AR: ["arezzo"],
  AT: ["asti"],
  AV: ["avellino"],
  BA: ["bari"],
  BG: ["bergamo"],
  BI: ["biella"],
  BL: ["belluno"],
  BN: ["benevento"],
  BO: ["bologna"],
  BR: ["brindisi"],
  BS: ["brescia"],
  BT: ["barletta andria trani"],
  BZ: ["bolzano", "bozen", "provincia autonoma di bolzano"],
  CA: ["cagliari"],
  CB: ["campobasso"],
  CE: ["caserta"],
  CH: ["chieti"],
  CL: ["caltanissetta"],
  CN: ["cuneo"],
  CO: ["como"],
  CR: ["cremona"],
  CS: ["cosenza"],
  CT: ["catania"],
  CZ: ["catanzaro"],
  EN: ["enna"],
  FC: ["forli cesena", "forli"],
  FE: ["ferrara"],
  FG: ["foggia"],
  FI: ["firenze", "florence"],
  FM: ["fermo"],
  FR: ["frosinone"],
  GE: ["genova", "genoa"],
  GO: ["gorizia"],
  GR: ["grosseto"],
  IM: ["imperia"],
  IS: ["isernia"],
  KR: ["crotone"],
  LC: ["lecco"],
  LE: ["lecce"],
  LI: ["livorno"],
  LO: ["lodi"],
  LT: ["latina"],
  LU: ["lucca"],
  MB: [
    "monza e brianza",
    "monza e della brianza",
    "monza brianza",
    "provincia di monza e della brianza",
    "provincia di monza e brianza",
  ],
  MC: ["macerata"],
  ME: ["messina"],
  MI: ["milano", "milan"],
  MN: ["mantova"],
  MO: ["modena"],
  MS: ["massa carrara"],
  MT: ["matera"],
  NA: ["napoli", "naples"],
  NO: ["novara"],
  NU: ["nuoro"],
  OR: ["oristano"],
  PA: ["palermo"],
  PC: ["piacenza"],
  PD: ["padova"],
  PE: ["pescara"],
  PG: ["perugia"],
  PI: ["pisa"],
  PN: ["pordenone"],
  PO: ["prato"],
  PR: ["parma"],
  PT: ["pistoia"],
  PU: ["pesaro e urbino", "pesaro urbino"],
  PV: ["pavia"],
  PZ: ["potenza"],
  RA: ["ravenna"],
  RC: ["reggio calabria", "reggio di calabria"],
  RE: ["reggio emilia", "reggio nell emilia"],
  RG: ["ragusa"],
  RI: ["rieti"],
  RM: ["roma", "rome"],
  RN: ["rimini"],
  RO: ["rovigo"],
  SA: ["salerno"],
  SI: ["siena"],
  SO: ["sondrio"],
  SP: ["la spezia", "spezia"],
  SR: ["siracusa"],
  SS: ["sassari"],
  SU: ["sud sardegna", "sud sardegna"],
  SV: ["savona"],
  TA: ["taranto"],
  TE: ["teramo"],
  TN: ["trento", "provincia autonoma di trento"],
  TO: ["torino", "turin"],
  TP: ["trapani"],
  TR: ["terni"],
  TS: ["trieste"],
  TV: ["treviso"],
  UD: ["udine"],
  VA: ["varese"],
  VB: ["verbano cusio ossola"],
  VC: ["vercelli"],
  VE: ["venezia", "venice"],
  VI: ["vicenza"],
  VR: ["verona"],
  VT: ["viterbo"],
  VV: ["vibo valentia"],
};

function romanToInteger(value: string): number | null {
  const upper = value.toUpperCase();

  if (!/^[IVXLCDM]+$/.test(upper)) {
    return null;
  }

  let total = 0;
  let previous = 0;

  for (let index = upper.length - 1; index >= 0; index -= 1) {
    const current = ROMAN_VALUES[upper[index] ?? ""];

    if (!current) return null;

    if (current < previous) {
      total -= current;
    } else {
      total += current;
      previous = current;
    }
  }

  return total > 0 && total <= 3999 ? total : null;
}


function normalizeItalianOdonymAbbreviations(value: string): string {
  const tokens = value.split(/\s+/).filter(Boolean);

  return tokens
    .map((token, index) => {
      const normalizedToken = normalizeRouteProComparableText(token)
        .replace(/\.$/, "");

      const nextToken = tokens[index + 1]
        ? normalizeRouteProComparableText(tokens[index + 1])
        : "";

      // Controlled expansion only when "s." is used as a title before a
      // following street-name token. We do not globally rewrite arbitrary
      // standalone "s".
      if (
        (normalizedToken === "s" || normalizedToken === "san") &&
        nextToken
      ) {
        return "san";
      }

      return token;
    })
    .join(" ");
}

export function normalizeRouteProStreetComparable(
  value: string | null | undefined,
): string {
  const rawValue = value ?? "";

  // RPSE-015C.4:
  // Preserve explicit dotted initials before generic punctuation cleanup.
  // Without this, "M." becomes "m" and romanToInteger() interprets it as
  // Roman numeral M = 1000, so "M. Montessori" can never match
  // "Maria Montessori".
  const dottedInitials = new Map<string, string>();
  let initialIndex = 0;

  const withInitialMarkers = rawValue.replace(
    /\b([A-Za-z])\.(?=\s|$)/g,
    (_match, initial: string) => {
      const marker = `rpinitial${initialIndex}`;
      initialIndex += 1;
      dottedInitials.set(marker, initial.toLowerCase());
      return marker;
    },
  );

  const normalized = normalizeItalianOdonymAbbreviations(
    normalizeRouteProComparableText(withInitialMarkers),
  );

  return normalized
    .split(" ")
    .map((token) => {
      const preservedInitial = dottedInitials.get(token);

      if (preservedInitial) {
        return preservedInitial;
      }

      const italianNumber = ITALIAN_NUMBER_WORDS[token];

      if (italianNumber) {
        return italianNumber;
      }

      const italianOrdinalNumber = ITALIAN_ORDINAL_NUMBER_WORDS[token];

      if (italianOrdinalNumber) {
        return italianOrdinalNumber;
      }

      const romanNumber = romanToInteger(token);

      return romanNumber !== null ? String(romanNumber) : token;
    })
    .join(" ")
    .replace(/\\s+/g, " ")
    .trim();
}


function routeProInitialNameTokensMatch(
  leftTokens: string[],
  rightTokens: string[],
): boolean {
  if (leftTokens.length !== rightTokens.length || leftTokens.length < 2) {
    return false;
  }

  let usedInitialExpansion = false;

  for (let index = 0; index < leftTokens.length; index += 1) {
    const left = leftTokens[index] ?? "";
    const right = rightTokens[index] ?? "";

    if (left === right) continue;

    const leftIsInitial = /^[a-z]$/.test(left);
    const rightIsInitial = /^[a-z]$/.test(right);

    if (
      leftIsInitial &&
      right.length > 1 &&
      right.startsWith(left)
    ) {
      usedInitialExpansion = true;
      continue;
    }

    if (
      rightIsInitial &&
      left.length > 1 &&
      left.startsWith(right)
    ) {
      usedInitialExpansion = true;
      continue;
    }

    return false;
  }

  return usedInitialExpansion;
}

const ROUTEPRO_STREET_TYPE_TOKENS = new Set([
  "via",
  "viale",
  "vicolo",
  "piazza",
  "piazzale",
  "corso",
  "largo",
  "strada",
  "contrada",
  "localita",
  "frazione",
]);

function stripRouteProStreetType(tokens: string[]): string[] {
  if (tokens.length > 1 && ROUTEPRO_STREET_TYPE_TOKENS.has(tokens[0] ?? "")) {
    return tokens.slice(1);
  }

  return tokens;
}

export function routeProStreetNamesMatch(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  const left = normalizeRouteProStreetComparable(first);
  const right = normalizeRouteProStreetComparable(second);

  if (!left || !right) return false;

  if (left === right) return true;

  const leftTokens = left.split(/\s+/).filter(Boolean);
  const rightTokens = right.split(/\s+/).filter(Boolean);

  if (routeProInitialNameTokensMatch(leftTokens, rightTokens)) {
    return true;
  }

  const leftOdonymTokens = stripRouteProStreetType(leftTokens);
  const rightOdonymTokens = stripRouteProStreetType(rightTokens);

  if (
    routeProInitialNameTokensMatch(
      leftOdonymTokens,
      rightOdonymTokens,
    )
  ) {
    return true;
  }

  // RPSE-015C.1:
  // Candidate text can contain both candidate.street and candidate.label,
  // so the relevant odonym may be only a token window inside a longer string.
  // Compare equal-length windows while keeping the same strict initial rule.
  const shorterTokens =
    leftTokens.length <= rightTokens.length ? leftTokens : rightTokens;
  const longerTokens =
    leftTokens.length <= rightTokens.length ? rightTokens : leftTokens;

  if (shorterTokens.length >= 2 && longerTokens.length > shorterTokens.length) {
    for (
      let start = 0;
      start <= longerTokens.length - shorterTokens.length;
      start += 1
    ) {
      const window = longerTokens.slice(
        start,
        start + shorterTokens.length,
      );

      if (routeProInitialNameTokensMatch(shorterTokens, window)) {
        return true;
      }
    }
  }

  const isWholeTokenSequence = (
    shorter: string[],
    longer: string[],
  ): boolean => {
    if (shorter.length === 0 || shorter.length > longer.length) {
      return false;
    }

    for (
      let start = 0;
      start <= longer.length - shorter.length;
      start += 1
    ) {
      const matches = shorter.every(
        (token, offset) => longer[start + offset] === token,
      );

      if (matches) return true;
    }

    return false;
  };

  const shorter =
    leftTokens.length <= rightTokens.length ? leftTokens : rightTokens;
  const longer =
    leftTokens.length <= rightTokens.length ? rightTokens : leftTokens;

  return isWholeTokenSequence(shorter, longer);
}

function parseHouseNumber(
  value: string | null | undefined,
): {
  full: string;
  base: string;
  suffix: string | null;
} | null {
  const normalized = (value ?? "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "/")
    .trim();

  if (!normalized) return null;

  const match = normalized.match(/^(\d+)(?:\/?([A-Z]+|\d+))?$/);

  if (!match?.[1]) {
    return {
      full: normalized,
      base: normalized,
      suffix: null,
    };
  }

  return {
    full: normalized,
    base: match[1],
    suffix: match[2] ?? null,
  };
}

export function compareRouteProHouseNumbers(
  requested: string | null | undefined,
  candidate: string | null | undefined,
): RouteProHouseNumberMatch {
  const left = parseHouseNumber(requested);
  const right = parseHouseNumber(candidate);

  if (!left) return "exact";
  if (!right) return "missing";

  if (left.full === right.full) {
    return "exact";
  }

  if (left.base === right.base) {
    return "base_match";
  }

  return "mismatch";
}

export function routeProProvincesMatch(
  expected: string | null | undefined,
  candidateText: string | null | undefined,
): boolean {
  const expectedNormalized = normalizeRouteProComparableText(expected ?? "");
  const candidateNormalized = normalizeRouteProComparableText(
    candidateText ?? "",
  );

  if (!expectedNormalized || !candidateNormalized) {
    return false;
  }

  if (
    candidateNormalized.includes(expectedNormalized) ||
    expectedNormalized.includes(candidateNormalized)
  ) {
    return true;
  }

  const expectedCode = expectedNormalized.toUpperCase();

  if (/^[A-Z]{2}$/.test(expectedCode)) {
    const aliases = ITALIAN_PROVINCES[expectedCode] ?? [];

    return aliases.some((alias) =>
      candidateNormalized.includes(
        normalizeRouteProComparableText(alias),
      ),
    );
  }

  for (const [code, aliases] of Object.entries(ITALIAN_PROVINCES)) {
    const normalizedAliases = aliases.map((alias) =>
      normalizeRouteProComparableText(alias),
    );

    if (
      normalizedAliases.some(
        (alias) =>
          expectedNormalized.includes(alias) ||
          alias.includes(expectedNormalized),
      )
    ) {
      return (
        candidateNormalized.includes(code.toLowerCase()) ||
        normalizedAliases.some((alias) =>
          candidateNormalized.includes(alias),
        )
      );
    }
  }

  return false;
}