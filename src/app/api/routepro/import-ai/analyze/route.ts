import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRouteProUsageState } from "@/modules/routepro/server/routepro-usage";
import {
  buildAiImportSummary,
  getAiImportOptimizationBlockReason,
} from "@/modules/routepro/server/routepro.ai-import-guards";
import { routeProAiImportPreviewStore } from "@/modules/routepro/server/routepro.ai-import-store";
import { extractRouteProStopsWithOpenAiVisionBatches } from "@/modules/routepro/server/routepro.ai-batch";
import type { RouteProAiImportPreview } from "@/modules/routepro/types/routepro.ai-import.types";
import { buildRouteProAiRecoveryPlan } from "@/modules/routepro/server/routepro.ai-recovery";

export const runtime = "nodejs";

const MAX_SCREENSHOTS = 60;

function isValidImage(file: File): boolean {
  return [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ].includes(file.type);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Devi accedere per usare RoutePro.",
        },
        { status: 401 },
      );
    }

    /*
     * GO LIVE:
     *
     * Prima di avviare il trial RoutePro richiediamo che
     * l'indirizzo email dell'utente sia stato confermato.
     *
     * Questo controllo avviene PRIMA di:
     * - creare il trial
     * - registrare il dispositivo
     * - effettuare chiamate OpenAI
     */
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Verifica il tuo indirizzo email prima di iniziare la prova gratuita di RoutePro.",
        },
        { status: 403 },
      );
    }

    const deviceId = request.headers.get(
      "x-routepro-device-id",
    );

    const usageState = await getRouteProUsageState(
      user.id,
      deviceId,
    );

    if (!usageState.allowed) {
      let message =
        "RoutePro non è disponibile per questo account.";

      if (usageState.reason === "trial_disabled") {
        message =
          "La prova gratuita di RoutePro non è disponibile in questo momento.";
      } else if (
        usageState.reason === "trial_device_required"
      ) {
        message =
          "Impossibile avviare la prova gratuita da questo dispositivo.";
      } else if (
        usageState.reason === "trial_device_already_used"
      ) {
        message =
          "La prova gratuita di RoutePro è già stata utilizzata su questo dispositivo.";
      } else if (
        usageState.reason === "trial_expired"
      ) {
        message =
          "La prova gratuita di RoutePro è scaduta.";
      } else if (
        usageState.reason === "trial_exhausted"
      ) {
        message =
          "Hai utilizzato tutte le rotte incluse nella prova gratuita.";
      } else if (
        usageState.reason === "paid_quota_exhausted"
      ) {
        message =
          "Hai raggiunto il limite mensile di rotte RoutePro.";
      } else if (
        usageState.reason === "account_inactive"
      ) {
        message = "Questo account non è attivo.";
      }

      return NextResponse.json(
        {
          ok: false,
          message,
          usage: usageState,
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    const files = formData
      .getAll("screenshots")
      .filter(
        (file): file is File =>
          file instanceof File && file.size > 0,
      );

    if (files.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Carica almeno uno screenshot.",
        },
        { status: 400 },
      );
    }

    if (files.length > MAX_SCREENSHOTS) {
      return NextResponse.json(
        {
          ok: false,
          message: `Puoi caricare massimo ${MAX_SCREENSHOTS} screenshot per batch.`,
        },
        { status: 400 },
      );
    }

    const invalidFile = files.find(
      (file) => !isValidImage(file),
    );

    if (invalidFile) {
      return NextResponse.json(
        {
          ok: false,
          message: `Formato file non supportato: ${invalidFile.name}`,
        },
        { status: 400 },
      );
    }

    const { batchResults, mergedStops } =
      await extractRouteProStopsWithOpenAiVisionBatches(
        files,
      );

    console.info(
      "RoutePro AI Batch Diagnostic:",
      JSON.stringify(
        batchResults.map((batch) => ({
          batchIndex: batch.batchIndex,
          batchTotal: batch.batchTotal,
          fileNames: batch.fileNames,
          extractedStops: batch.stops.length,
        })),
        null,
        2,
      ),
    );

    const stops = mergedStops;

    console.info(
      "RoutePro AI Address Intelligence Diagnostic:",
      JSON.stringify(
        stops.map((stop) => ({
          originalStopNumber:
            stop.originalStopNumber,
          addressRaw: stop.addressRaw,
          interpretedAddress:
            stop.interpretedAddress ?? null,
          street: stop.street ?? null,
          houseNumber: stop.houseNumber ?? null,
          locality: stop.locality ?? null,
          municipality: stop.municipality ?? null,
          province: stop.province ?? null,
          postalCode: stop.postalCode ?? null,
          countryCode: stop.countryCode ?? null,
          interpretationConfidence:
            stop.interpretationConfidence ?? null,
          city: stop.city ?? null,
          confidence: stop.confidence,
          isPlaceholder: stop.isPlaceholder,
          needsReviewReason:
            stop.needsReviewReason ?? null,
        })),
        null,
        2,
      ),
    );

    const batchSummaries = batchResults.map(
      (batch) => ({
        batchIndex: batch.batchIndex,
        batchTotal: batch.batchTotal,
        fileNames: batch.fileNames,
        extractedStops: batch.stops.length,
      }),
    );

    const summary = buildAiImportSummary(stops);
    const recoveryPlan =
      buildRouteProAiRecoveryPlan(stops);
    const blockingReason =
      getAiImportOptimizationBlockReason(summary);

    const preview: RouteProAiImportPreview = {
      importId: crypto.randomUUID(),
      summary,
      batchSummaries,
      stops,
      recoveryPlan,
      canCreateRoute: stops.length > 0,
      canOptimize: blockingReason === null,
      blockingReason,
    };

    routeProAiImportPreviewStore.set(
      preview.importId,
      preview,
    );

    return NextResponse.json({
      ok: true,
      preview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Errore imprevisto durante l'analisi AI.",
      },
      { status: 500 },
    );
  }
}