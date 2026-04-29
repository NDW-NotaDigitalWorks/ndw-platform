"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  AgendaEventStatus,
  CreateAgendaEventInput,
  UpdateAgendaEventInput,
} from "@/modules/agenda/types";

function normalizeOptionalText(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeOptionalTime(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeStatus(value: FormDataEntryValue | null): AgendaEventStatus {
  const status = String(value ?? "scheduled");

  if (
    status === "scheduled" ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "scheduled";
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Utente non autenticato.");
  }

  return user.id;
}

export async function createAgendaEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const input: CreateAgendaEventInput = {
    title: String(formData.get("title") ?? "").trim(),
    description: normalizeOptionalText(formData.get("description")) ?? undefined,
    eventDate: String(formData.get("eventDate") ?? "").trim(),
    startTime: normalizeOptionalTime(formData.get("startTime")) ?? undefined,
    endTime: normalizeOptionalTime(formData.get("endTime")) ?? undefined,
  };

  if (!input.title) {
    throw new Error("Il titolo evento è obbligatorio.");
  }

  if (!input.eventDate) {
    throw new Error("La data evento è obbligatoria.");
  }

  const { error } = await supabase.from("agenda_events").insert({
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    event_date: input.eventDate,
    start_time: input.startTime ?? null,
    end_time: input.endTime ?? null,
    status: "scheduled",
  });

  if (error) {
    throw new Error(`Creazione evento fallita: ${error.message}`);
  }

  revalidatePath("/app/agenda");
}

export async function updateAgendaEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const input: UpdateAgendaEventInput = {
    id: String(formData.get("id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    description: normalizeOptionalText(formData.get("description")) ?? undefined,
    eventDate: String(formData.get("eventDate") ?? "").trim(),
    startTime: normalizeOptionalTime(formData.get("startTime")) ?? undefined,
    endTime: normalizeOptionalTime(formData.get("endTime")) ?? undefined,
    status: normalizeStatus(formData.get("status")),
  };

  if (!input.id) {
    throw new Error("ID evento mancante.");
  }

  if (!input.title) {
    throw new Error("Il titolo evento è obbligatorio.");
  }

  if (!input.eventDate) {
    throw new Error("La data evento è obbligatoria.");
  }

  const { error } = await supabase
    .from("agenda_events")
    .update({
      title: input.title,
      description: input.description ?? null,
      event_date: input.eventDate,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      status: input.status,
    })
    .eq("id", input.id);

  if (error) {
    throw new Error(`Modifica evento fallita: ${error.message}`);
  }

  revalidatePath("/app/agenda");
}

export async function deleteAgendaEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("ID evento mancante.");
  }

  const { error } = await supabase.from("agenda_events").delete().eq("id", id);

  if (error) {
    throw new Error(`Eliminazione evento fallita: ${error.message}`);
  }

  revalidatePath("/app/agenda");
}

export async function updateAgendaEventStatus(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();
  const status = normalizeStatus(formData.get("status"));

  if (!id) {
    throw new Error("ID evento mancante.");
  }

  const { error } = await supabase
    .from("agenda_events")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Aggiornamento stato evento fallito: ${error.message}`);
  }

  revalidatePath("/app/agenda");
}