import { createClient } from "@/lib/supabase/server";
import type {
  AgendaEvent,
  AgendaEventFilter,
  AgendaEventRow,
} from "@/modules/agenda/types";

function mapAgendaEventRow(row: AgendaEventRow): AgendaEvent {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export async function getAgendaEvents(
  filter: AgendaEventFilter = "today"
): Promise<AgendaEvent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("agenda_events")
    .select(
      "id,user_id,title,description,event_date,start_time,end_time,status,created_at,updated_at"
    )
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (filter === "today") {
    query = query.eq("event_date", getTodayDate());
  }

  if (filter === "week") {
    query = query
      .gte("event_date", getTodayDate())
      .lte("event_date", getWeekEndDate());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Agenda events query failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapAgendaEventRow(row as AgendaEventRow));
}