import { NextResponse } from "next/server";
import { routeProAiImportPreviewStore } from "@/modules/routepro/server/routepro.ai-import-store";
import { createClient } from "@/lib/supabase/server";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const runtime = "nodejs";


type CreateRoutePayload = {
  importId?: string;
  editedStops?: RouteProAiExtractedStop[];
};
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoutePayload;

    if (!body.importId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Import AI non valido.",
        },
        { status: 400 },
      );
    }

    const preview = routeProAiImportPreviewStore.get(body.importId);

    if (!preview) {
      return NextResponse.json(
        {
          ok: false,
          message: "Preview AI scaduta. Ripeti l’analisi degli screenshot.",
        },
        { status: 404 },
      );
    }

    const finalStops = body.editedStops?.length ? body.editedStops : preview.stops;

const hasBlockingPlaceholders = finalStops.some(
  (stop) => stop.isPlaceholder || stop.addressRaw.trim().length === 0,
);

    if (hasBlockingPlaceholders) {
  return NextResponse.json(
    {
      ok: false,
      message: "Correggi gli stop mancanti prima di creare la rotta.",
    },
    { status: 400 },
  );
}

    const supabase = await createClient();

    const authResult = await supabase.auth.getUser();
    const user = authResult.data.user;

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Utente non autenticato.",
        },
        { status: 401 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: route, error: routeError } = await supabase
      .from("ndw_routepro_routes")
      .insert({
        user_id: user.id,
        name: `AI Screenshot Import - ${today}`,
        route_date: today,
        status: "draft",
        is_optimized: false,
        optimization_method: null,
        route_profile: "amazon_flex",
      })
      .select("id")
      .single();

    if (routeError || !route) {
      return NextResponse.json(
        {
          ok: false,
          message: routeError?.message ?? "Creazione rotta non riuscita.",
        },
        { status: 500 },
      );
    }

    const stopRows = finalStops.map((stop) => ({
      route_id: route.id,
      stop_type: stop.originalStopNumber === 1 ? "start" : "delivery",
      original_stop_number: stop.originalStopNumber,
      optimized_stop_number: null,
      address_raw: stop.addressRaw,
      address_normalized: stop.addressRaw.trim().toLowerCase(),
      status: stop.confidence === "high" ? "pending" : "needs_review",
      estimated_service_minutes: 3,
      duplicate_group_key: null,
      nearby_group_key: null,
      is_front_side_pair: false,
    }));

    const { error: stopsError } = await supabase
      .from("ndw_routepro_stops")
      .insert(stopRows);

    if (stopsError) {
      await supabase.from("ndw_routepro_routes").delete().eq("id", route.id);

      return NextResponse.json(
        {
          ok: false,
          message: stopsError.message,
        },
        { status: 500 },
      );
    }

    routeProAiImportPreviewStore.delete(body.importId);

    return NextResponse.json({
      ok: true,
      routeId: route.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Errore imprevisto durante la creazione rotta.",
      },
      { status: 500 },
    );
  }
}