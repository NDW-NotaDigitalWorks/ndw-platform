import {
  createAgendaEvent,
  deleteAgendaEvent,
  updateAgendaEvent,
  updateAgendaEventStatus,
} from "@/modules/agenda/server/agenda.actions";
import { getAgendaEvents } from "@/modules/agenda/server/agenda.queries";
import type { AgendaEventFilter, AgendaEventStatus } from "@/modules/agenda/types";
import { agendaTranslations } from "@/modules/agenda/i18n";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";
import Link from "next/link";

type Props = {
  searchParams?: {
    filter?: string;
  };
};

function normalizeFilter(value: string | undefined): AgendaEventFilter {
  if (value === "today" || value === "week" || value === "all") {
    return value;
  }
  return "today";
}

function getStatusLabel(status: AgendaEventStatus, t: typeof agendaTranslations.it) {
  if (status === "completed") return t.statusCompleted;
  if (status === "cancelled") return t.statusCancelled;
  return t.statusScheduled;
}

function getStatusColor(status: AgendaEventStatus) {
  if (status === "completed") return theme.colors.success;
  if (status === "cancelled") return theme.colors.danger;
  return theme.colors.primary;
}

export default async function AgendaModulePage({ searchParams }: Props) {
  const locale = "it";
  const t = agendaTranslations[locale];

  const filter = normalizeFilter(searchParams?.filter);
  const events = await getAgendaEvents(filter);

  return (
    <section style={ui.page.section}>
      {/* HEADER */}
      <div>
        <p style={ui.page.eyebrow}>NDW Module</p>
        <h1 style={ui.page.title}>{t.title}</h1>
        <p style={ui.page.subtitle}>{t.subtitle}</p>
      </div>

      {/* FILTER */}
      <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/app/agenda?filter=today" style={ui.button.secondary}>
          {t.filterToday}
        </Link>
        <Link href="/app/agenda?filter=week" style={ui.button.secondary}>
          {t.filterWeek}
        </Link>
        <Link href="/app/agenda?filter=all" style={ui.button.secondary}>
          {t.filterAll}
        </Link>
      </div>

      {/* CREATE EVENT */}
      <div style={{ marginTop: 32, ...ui.card.base }}>
        <h2 style={ui.page.sectionTitle}>{t.createEvent}</h2>

        <form action={createAgendaEvent} style={{ marginTop: 18 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 620 }}>
            <label style={ui.form.label}>
              {t.eventTitle}
              <input name="title" required style={ui.form.input} />
            </label>

            <label style={ui.form.label}>
              {t.eventDescription}
              <textarea name="description" rows={3} style={ui.form.input} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <label style={ui.form.label}>
                {t.eventDate}
                <input name="eventDate" type="date" required style={ui.form.input} />
              </label>

              <label style={ui.form.label}>
                {t.startTime}
                <input name="startTime" type="time" style={ui.form.input} />
              </label>

              <label style={ui.form.label}>
                {t.endTime}
                <input name="endTime" type="time" style={ui.form.input} />
              </label>
            </div>

            <button type="submit" style={ui.button.primary}>
              {t.createEvent}
            </button>
          </div>
        </form>
      </div>

      {/* EVENTS LIST */}
      <div style={{ marginTop: 32 }}>
        <h2 style={ui.page.sectionTitle}>Eventi</h2>

        {events.length === 0 ? (
          <div style={ui.card.base}>
            <p style={{ margin: 0, color: theme.colors.textMuted }}>{t.emptyState}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {events.map((event) => (
              <article key={event.id} style={ui.card.base}>
                <form action={updateAgendaEvent}>
                  <input type="hidden" name="id" value={event.id} />

                  <div style={{ display: "grid", gap: 12 }}>
                    <input name="title" defaultValue={event.title} required style={ui.form.input} />

                    <textarea
                      name="description"
                      defaultValue={event.description ?? ""}
                      rows={2}
                      style={ui.form.input}
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <input
                        name="eventDate"
                        type="date"
                        defaultValue={event.eventDate}
                        required
                        style={ui.form.input}
                      />

                      <input
                        name="startTime"
                        type="time"
                        defaultValue={event.startTime ?? ""}
                        style={ui.form.input}
                      />

                      <input
                        name="endTime"
                        type="time"
                        defaultValue={event.endTime ?? ""}
                        style={ui.form.input}
                      />

                      <select name="status" defaultValue={event.status} style={ui.form.input}>
                        <option value="scheduled">{t.statusScheduled}</option>
                        <option value="completed">{t.statusCompleted}</option>
                        <option value="cancelled">{t.statusCancelled}</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          color: getStatusColor(event.status),
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: getStatusColor(event.status),
                          }}
                        />
                        {getStatusLabel(event.status, t)}
                      </div>

                      <button type="submit" style={ui.button.primary}>
                        {t.editEvent}
                      </button>
                    </div>
                  </div>
                </form>

                <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <form action={updateAgendaEventStatus}>
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button type="submit" style={ui.button.secondary}>
                      {t.statusCompleted}
                    </button>
                  </form>

                  <form action={updateAgendaEventStatus}>
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button type="submit" style={ui.button.secondary}>
                      {t.statusCancelled}
                    </button>
                  </form>

                  <form action={deleteAgendaEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <button type="submit" style={ui.button.danger}>
                      {t.deleteEvent}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}