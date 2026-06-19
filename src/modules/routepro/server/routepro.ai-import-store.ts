import type { RouteProAiImportPreview } from "@/modules/routepro/types/routepro.ai-import.types";

const globalForAiImport = globalThis as typeof globalThis & {
  __routeProAiImportPreviewStore?: Map<string, RouteProAiImportPreview>;
};

export const routeProAiImportPreviewStore =
  globalForAiImport.__routeProAiImportPreviewStore ??
  new Map<string, RouteProAiImportPreview>();

globalForAiImport.__routeProAiImportPreviewStore = routeProAiImportPreviewStore;