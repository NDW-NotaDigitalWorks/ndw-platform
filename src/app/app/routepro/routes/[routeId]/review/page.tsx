import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyRouteProRouteDetail } from "@/modules/routepro/server/routepro.routes";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProWorkflowShell } from "@/modules/routepro/v2/ui/RouteProWorkflowShell";
import { RouteProReviewStopsClient } from "@/modules/routepro/ui/RouteProReviewStopsClient";

type Props = {
  params: Promise<{ routeId: string }>;
};

const progressPanelStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 20,
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,64,175,0.9) 100%)",
  border: "1px solid rgba(147,197,253,0.25)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
};

const progressHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
};

const progressEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 10,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const progressTitleStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#ffffff",
  fontSize: 18,
  lineHeight: 1.2,
  fontWeight: 950,
};

const progressValueStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 27,
  lineHeight: 1,
  fontWeight: 950,
};

const progressDescriptionStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#bfdbfe",
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 800,
};

const progressTrackStyle: React.CSSProperties = {
  height: 8,
  marginTop: 14,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const metricCardStyle: React.CSSProperties = {
  minWidth: 0,
  padding: 14,
  borderRadius: 18,
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 14px 34px rgba(0,0,0,0.2)",
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const metricValueStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const metricHintStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.35,
  fontWeight: 700,
};

const contentSectionStyle: React.CSSProperties = {
  marginTop: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 23,
  lineHeight: 1.15,
  fontWeight: 950,
};

const sectionTextStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 650,
};

const emptyStateStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 20,
  borderRadius: 22,
  background: "rgba(15,23,42,0.96)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const actionsStyle: React.CSSProperties = {
  position: "sticky",
  bottom: 12,
  zIndex: 18,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 22,
  padding: 12,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
  backdropFilter: "blur(16px)",
};

const actionInfoStyle: React.CSSProperties = {
  flex: "1 1 200px",
  minWidth: 0,
};

const actionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 13,
  lineHeight: 1.35,
  fontWeight: 900,
};

const actionTextStyle: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#64748b",
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 700,
};

export default async function RouteProReviewPage({ params }: Props) {
  const { routeId } = await params;
  const route = await getMyRouteProRouteDetail(routeId);

  if (!route) {
    notFound();
  }

  const totalStops = route.stops.length;

  const confirmedStops = route.stops.filter((stop) =>
    ["valid", "completed", "skipped"].includes(stop.status),
  ).length;

  const needsReviewStops = route.stops.filter(
    (stop) => stop.status === "needs_review",
  ).length;

  const rawStops = route.stops.filter(
    (stop) => stop.status === "raw",
  ).length;

  const attentionStops = needsReviewStops + rawStops;

  const reviewedStops = Math.max(0, totalStops - attentionStops);

  const reviewProgress =
    totalStops > 0
      ? Math.round((reviewedStops / totalStops) * 100)
      : 0;

  return (
    <RouteProWorkflowShell
      routeId={routeId}
      currentStep="Review"
      title="Controlla la tua rotta"
      subtitle="Concentrati sugli stop che richiedono attenzione. Quelli già confermati sono pronti per la verifica."
    >
      <section style={progressPanelStyle}>
        <div style={progressHeaderStyle}>
          <div>
            <p style={progressEyebrowStyle}>Stato della Review</p>

            <h2 style={progressTitleStyle}>
              {reviewProgress === 100
                ? "Review completata"
                : attentionStops > 0
                  ? `${attentionStops} stop richiedono attenzione`
                  : "Controllo degli stop in corso"}
            </h2>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={progressValueStyle}>{reviewProgress}%</p>

            <p style={progressDescriptionStyle}>
              {reviewedStops} di {totalStops} stop pronti
            </p>
          </div>
        </div>

        <div style={progressTrackStyle}>
          <div
            style={{
              width: `${reviewProgress}%`,
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #2563eb 0%, #3b82f6 65%, #60a5fa 100%)",
              boxShadow: "0 0 18px rgba(59,130,246,0.42)",
              transition: "width 0.25s ease",
            }}
          />
        </div>
      </section>

      <div style={metricsGridStyle}>
        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Stop totali</p>
          <h2 style={metricValueStyle}>{totalStops}</h2>
          <p style={metricHintStyle}>Presenti nella rotta</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Confermati</p>
          <h2 style={metricValueStyle}>{confirmedStops}</h2>
          <p style={metricHintStyle}>Pronti per il workflow</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Da controllare</p>
          <h2 style={metricValueStyle}>{needsReviewStops}</h2>
          <p style={metricHintStyle}>Richiedono attenzione</p>
        </article>

        <article style={metricCardStyle}>
          <p style={metricLabelStyle}>Non elaborati</p>
          <h2 style={metricValueStyle}>{rawStops}</h2>
          <p style={metricHintStyle}>Dati ancora grezzi</p>
        </article>
      </div>

      <section style={contentSectionStyle}>
        <h2 style={sectionTitleStyle}>Controllo degli stop</h2>

        <p style={sectionTextStyle}>
          Cerca per numero, indirizzo, stato o origine. Gli elenchi lunghi
          vengono caricati progressivamente per ridurre lo scroll.
        </p>

        {route.stops.length === 0 ? (
          <div style={emptyStateStyle}>
            <p
              style={{
                margin: 0,
                color: "#e2e8f0",
                fontSize: 15,
                lineHeight: 1.55,
                fontWeight: 700,
              }}
            >
              Non sono ancora presenti stop. Importa screenshot, una lista
              di indirizzi o un file CSV.
            </p>

            <div style={{ marginTop: 16 }}>
              <Link
                href={`/app/routepro/${route.id}`}
                style={routeProUi.primaryButton}
              >
                Importa stop
              </Link>
            </div>
          </div>
        ) : (
          <RouteProReviewStopsClient stops={route.stops} />
        )}
      </section>

      <div style={actionsStyle}>
        <div style={actionInfoStyle}>
          <p style={actionTitleStyle}>
            {attentionStops > 0
              ? `${attentionStops} stop saranno controllati nella verifica`
              : "La rotta è pronta per la verifica"}
          </p>

          <p style={actionTextStyle}>
            Il passaggio successivo controllerà indirizzi e coordinate prima
            dell’ottimizzazione.
          </p>
        </div>

        <Link
          href={`/app/routepro/routes/${route.id}/verify`}
          style={routeProUi.primaryButton}
        >
          Continua alla verifica
        </Link>

        <Link
          href={`/app/routepro/${route.id}`}
          style={routeProUi.secondaryButton}
        >
          Vista classica
        </Link>
      </div>
    </RouteProWorkflowShell>
  );
}