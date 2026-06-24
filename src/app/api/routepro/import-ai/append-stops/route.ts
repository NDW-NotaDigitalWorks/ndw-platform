import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const runtime = "nodejs";

type AppendStopsPayload = {
  routeId?: string;
  editedStops?: RouteProAiExtractedStop[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppendStopsPayload;

    if (!body.routeId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Route ID mancante.",
        },
        { status: 400 },
      );
    }

    const finalStops = body.editedStops ?? [];

    if (finalStops.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nessuno stop da importare.",
        },
        { status: 400 },
      );
    }

    const hasBlockingPlaceholders = finalStops.some(
      (stop) => stop.isPlaceholder || stop.addressRaw.trim().length === 0,
    );

    if (hasBlockingPlaceholders) {
      return NextResponse.json(
        {
          ok: false,
          message: "Correggi gli stop mancanti prima di importarli nella rotta.",
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

    const { data: route, error: routeError } = await supabase
      .from("routepro_routes")
      .select("id,user_id")
      .eq("id", body.routeId)
      .single();

    if (routeError || !route) {
      return NextResponse.json(
        {
          ok: false,
          message: routeError?.message ?? "Rotta non trovata.",
        },
        { status: 404 },
      );
    }

    if (route.user_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          message: "Non puoi modificare questa rotta.",
        },
        { status: 403 },
      );
    }

    const { error: deleteExistingStopsError } = await supabase
      .from("routepro_stops")
      .delete()
      .eq("route_id", body.routeId);

    if (deleteExistingStopsError) {
      return NextResponse.json(
        {
          ok: false,
          message: deleteExistingStopsError.message,
        },
        { status: 500 },
      );
    }

    const stopRows = finalStops.map((stop, index) => ({
  route_id: route.id,
  position: index + 1,
  original_position: stop.originalStopNumber,
  address: stop.city
    ? `${stop.addressRaw}, ${stop.city}`
    : stop.addressRaw,
  lat: null,
  lng: null,
  status: stop.confidence === "high" ? "raw" : "needs_review",
  source: "ai_screenshot",
}));

    const { error: stopsError } = await supabase
      .from("routepro_stops")
      .insert(stopRows);

    if (stopsError) {
      return NextResponse.json(
        {
          ok: false,
          message: stopsError.message,
        },
        { status: 500 },
      );
    }

    await supabase
      .from("routepro_routes")
      .update({
        is_optimized: false,
        optimized_at: null,
        optimization_method: null,
      })
      .eq("id", body.routeId);

    return NextResponse.json({
      ok: true,
      routeId: body.routeId,
      importedStops: finalStops.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Errore imprevisto durante l’import degli stop.",
      },
      { status: 500 },
    );
  }
}