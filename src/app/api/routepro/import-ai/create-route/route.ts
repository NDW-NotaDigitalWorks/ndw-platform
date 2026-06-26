import { NextResponse } from "next/server";
import { routeProAiImportPreviewStore } from "@/modules/routepro/server/routepro.ai-import-store";
import { createClient } from "@/lib/supabase/server";
import type { RouteProAiExtractedStop } from "@/modules/routepro/types/routepro.ai-import.types";

export const runtime = "nodejs";


type CreateRoutePayload = {
  importId?: string;
  editedStops?: RouteProAiExtractedStop[];
  name?: string;
  routeDate?: string;
  routeProfile?: string;
  startAddress?: string;
  returnAddress?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  breakMinutes?: number;
};
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoutePayload;

    if (!body.importId && !body.editedStops?.length) {
      return NextResponse.json(
        {
          ok: false,
          message: "Import AI non valido.",
        },
        { status: 400 },
      );
    }

    const preview = body.importId
  ? routeProAiImportPreviewStore.get(body.importId)
  : null;

const finalStops = body.editedStops?.length ? body.editedStops : preview?.stops;

if (!finalStops?.length) {
  return NextResponse.json(
    {
      ok: false,
      message: "Preview AI scaduta. Ripeti l’analisi degli screenshot.",
    },
    { status: 404 },
  );
}


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
    const routeDate = body.routeDate?.trim() || today;
    const routeName = body.name?.trim() || `RoutePro - ${routeDate}`;
    const routeProfile = body.routeProfile?.trim() || "generic";
    const startAddress = body.startAddress?.trim() || null;
    const returnAddress = body.returnAddress?.trim() || null;
    const shiftStartTime = body.shiftStartTime?.trim() || null;
    const shiftEndTime = body.shiftEndTime?.trim() || null;
    const breakMinutes =
  typeof body.breakMinutes === "number" && Number.isFinite(body.breakMinutes)
    ? body.breakMinutes
    : 30;

    const { data: route, error: routeError } = await supabase
      .from("routepro_routes")
      .insert({
  user_id: user.id,
  name: routeName,
  route_date: routeDate,
  status: "draft",
  is_optimized: false,
  optimization_method: null,
  route_profile: routeProfile,
  start_address: startAddress,
  return_address: returnAddress,
  shift_start_time: shiftStartTime,
  shift_end_time: shiftEndTime,
  break_minutes: breakMinutes,
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

    const stopRows = finalStops.map((stop, index) => {
  const hasAddress = stop.addressRaw.trim().length > 0;
  const shouldReview =
    stop.isPlaceholder ||
    !hasAddress ||
    stop.confidence === "low" ||
    stop.confidence === "needs_review";

  return {
    route_id: route.id,
    position: index + 1,
    original_position: stop.originalStopNumber,
    address: stop.city ? `${stop.addressRaw}, ${stop.city}` : stop.addressRaw,
    lat: null,
    lng: null,
    status: shouldReview ? "needs_review" : "valid",
  };
});

    const { error: stopsError } = await supabase
      .from("routepro_stops")
      .insert(stopRows);

    if (stopsError) {
      await supabase.from("routepro_routes").delete().eq("id", route.id);

      return NextResponse.json(
        {
          ok: false,
          message: `${stopsError.message} | ${stopsError.details ?? ""} | ${stopsError.hint ?? ""} | ${stopsError.code ?? ""}`,
        },
        { status: 500 },
      );
    }

    if (body.importId) {
  routeProAiImportPreviewStore.delete(body.importId);
}

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