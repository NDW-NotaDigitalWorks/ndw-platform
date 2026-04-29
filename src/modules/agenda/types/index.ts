export type AgendaEventStatus = "scheduled" | "completed" | "cancelled";

export type AgendaEvent = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  status: AgendaEventStatus;
  createdAt: string;
  updatedAt: string;
};

export type AgendaEventRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  status: AgendaEventStatus;
  created_at: string;
  updated_at: string;
};

export type AgendaEventFilter = "today" | "week" | "all";

export type CreateAgendaEventInput = {
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
};

export type UpdateAgendaEventInput = {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  status: AgendaEventStatus;
};