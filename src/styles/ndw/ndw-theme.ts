import { ndwTokens } from "./ndw-tokens";
import { ndwModuleAccents } from "./ndw-module-accents";

export const ndwTheme = {
  tokens: ndwTokens,
  moduleAccents: ndwModuleAccents,
} as const;

export type NdwTheme = typeof ndwTheme;