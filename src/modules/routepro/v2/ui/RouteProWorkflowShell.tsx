import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProWorkflowHeader } from "@/modules/routepro/v2/ui/RouteProWorkflowHeader";
import { ui } from "@/styles/ui";

type StepStatus = "completed" | "current" | "pending";

type WorkflowStep =
  | "Review"
  | "Verify"
  | "Optimize"
  | "Drive"
  | "Summary";

type Props = {
  routeId: string;
  title: string;
  subtitle: string;
  currentStep: WorkflowStep;
  children: ReactNode;
};

const steps: WorkflowStep[] = [
  "Review",
  "Verify",
  "Optimize",
  "Drive",
  "Summary",
];

const workflowStepNumber: Record<WorkflowStep, number> = {
  Review: 3,
  Verify: 4,
  Optimize: 5,
  Drive: 6,
  Summary: 7,
};

const workflowStepLabel: Record<WorkflowStep, string> = {
  Review: "Controllo degli stop",
  Verify: "Verifica degli indirizzi",
  Optimize: "Ottimizzazione del percorso",
  Drive: "Esecuzione della rotta",
  Summary: "Riepilogo finale",
};

const nextWorkflowStep: Record<WorkflowStep, string | null> = {
  Review: "Verify",
  Verify: "Optimize",
  Optimize: "Drive",
  Drive: "Summary",
  Summary: null,
};

const heroStyle: CSSProperties = {
  ...ui.card.base,
  position: "relative",
  overflow: "hidden",
  marginTop: 18,
  padding: "22px clamp(18px, 3vw, 30px)",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "radial-gradient(circle at 92% 0%, rgba(249,115,22,0.16) 0%, transparent 31%), linear-gradient(135deg,#172033 0%,#111827 72%)",
  boxShadow: "0 22px 54px rgba(0,0,0,0.26)",
};

const heroHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 18,
};

const heroCopyStyle: CSSProperties = {
  flex: "1 1 480px",
  minWidth: 0,
};

const eyebrowRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 9,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.11em",
};

const currentStepBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 24,
  padding: "4px 9px",
  borderRadius: 999,
  border: "1px solid rgba(251,146,60,0.34)",
  background: "rgba(249,115,22,0.12)",
  color: "#fed7aa",
  fontSize: 10,
  lineHeight: 1,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const progressBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 24,
  padding: "4px 9px",
  borderRadius: 999,
  border: "1px solid rgba(96,165,250,0.3)",
  background: "rgba(59,130,246,0.1)",
  color: "#bfdbfe",
  fontSize: 10,
  lineHeight: 1,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: "clamp(25px, 3.2vw, 38px)",
  lineHeight: 1.06,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const subtitleStyle: CSSProperties = {
  margin: "9px 0 0",
  maxWidth: 760,
  color: "#aebdd0",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 650,
};

const actionsStyle: CSSProperties = {
  flex: "0 1 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: 8,
};

const compactSecondaryButtonStyle: CSSProperties = {
  ...routeProUi.secondaryButton,
  minHeight: 38,
  padding: "0 13px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#cbd5e1",
  fontSize: 12,
  boxShadow: "none",
};

const workflowContainerStyle: CSSProperties = {
  marginTop: 18,
  paddingTop: 3,
  borderTop: "1px solid rgba(148,163,184,0.12)",
};

const workflowProgressCardStyle: CSSProperties = {
  marginTop: 16,
  padding: "14px 16px",
  borderRadius: 17,
  border: "1px solid rgba(148,163,184,0.16)",
  background:
    "linear-gradient(180deg,rgba(15,23,42,0.62) 0%,rgba(15,23,42,0.82) 100%)",
};

const workflowProgressHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
};

const workflowProgressBarStyle: CSSProperties = {
  height: 7,
  marginTop: 13,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(71,85,105,0.42)",
};

const contentCardStyle: CSSProperties = {
  ...ui.card.base,
  marginTop: 14,
  padding: "clamp(16px, 2.5vw, 24px)",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.075)",
  background:
    "linear-gradient(180deg,rgba(23,32,51,0.98) 0%,rgba(17,24,39,0.98) 100%)",
  boxShadow: "0 22px 54px rgba(0,0,0,0.24)",
};

function getStepStatus(
  step: WorkflowStep,
  currentStep: WorkflowStep,
): StepStatus {
  const stepIndex = steps.indexOf(step);
  const currentIndex = steps.indexOf(currentStep);

  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "pending";
}

export function RouteProWorkflowShell({
  routeId,
  title,
  subtitle,
  currentStep,
  children,
}: Props) {
  const currentStepNumber = workflowStepNumber[currentStep];
  const workflowPercent = Math.round((currentStepNumber / 7) * 100);
  const nextStep = nextWorkflowStep[currentStep];
  const isWorkflowCompleted = currentStep === "Summary";

  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Importa gli stop. Controlla la rotta. Guida in modo più intelligente." />

      <div style={heroStyle}>
        <div style={heroHeaderStyle}>
          <div style={heroCopyStyle}>
            <div style={eyebrowRowStyle}>
              <p style={eyebrowStyle}>RoutePro Workflow</p>

              <span style={currentStepBadgeStyle}>
                Fase attiva · {currentStep}
              </span>

              <span style={progressBadgeStyle}>
                Fase {currentStepNumber} di 7
              </span>
            </div>

            <h1 style={titleStyle}>{title}</h1>

            <p style={subtitleStyle}>{subtitle}</p>
          </div>

          <nav
            aria-label="Navigazione secondaria RoutePro"
            style={actionsStyle}
          >
            <Link
              href={`/app/routepro/${routeId}`}
              style={compactSecondaryButtonStyle}
            >
              Vista classica
            </Link>

            <Link
              href="/app/routepro"
              style={compactSecondaryButtonStyle}
            >
              Command Center
            </Link>
          </nav>
        </div>

        <div style={workflowContainerStyle}>
          <RouteProWorkflowHeader
            steps={[
              { label: "Import", status: "completed" },
              { label: "Extract", status: "completed" },
              {
                label: "Review",
                status: getStepStatus("Review", currentStep),
              },
              {
                label: "Verify",
                status: getStepStatus("Verify", currentStep),
              },
              {
                label: "Optimize",
                status: getStepStatus("Optimize", currentStep),
              },
              {
                label: "Drive",
                status: getStepStatus("Drive", currentStep),
              },
              {
                label: "Summary",
                status: getStepStatus("Summary", currentStep),
              },
            ]}
          />

          <div style={workflowProgressCardStyle}>
            <div style={workflowProgressHeaderStyle}>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    color: isWorkflowCompleted ? "#86efac" : "#93c5fd",
                    fontSize: 10,
                    lineHeight: 1.2,
                    fontWeight: 950,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {isWorkflowCompleted
                    ? "Workflow completato"
                    : "Avanzamento workflow"}
                </p>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#ffffff",
                    fontSize: 15,
                    lineHeight: 1.35,
                    fontWeight: 900,
                  }}
                >
                  {workflowStepLabel[currentStep]}
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#94a3b8",
                    fontSize: 12,
                    lineHeight: 1.4,
                    fontWeight: 700,
                  }}
                >
                  {nextStep
                    ? `Prossima fase: ${nextStep}`
                    : "Tutte le fasi operative sono state completate."}
                </p>
              </div>

              <div
                style={{
                  flex: "0 0 auto",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 25,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {workflowPercent}%
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: "#94a3b8",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {currentStepNumber} / 7 fasi
                </div>
              </div>
            </div>

            <div
              role="progressbar"
              aria-label="Avanzamento workflow RoutePro"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={workflowPercent}
              style={workflowProgressBarStyle}
            >
              <div
                style={{
                  width: `${workflowPercent}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: isWorkflowCompleted
                    ? "linear-gradient(90deg,#22c55e 0%,#4ade80 100%)"
                    : "linear-gradient(90deg,#f97316 0%,#fb923c 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={contentCardStyle}>{children}</div>
    </section>
  );
}
