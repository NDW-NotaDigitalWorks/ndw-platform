import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { RouteProWorkflowHeader } from "@/modules/routepro/v2/ui/RouteProWorkflowHeader";
import { ui } from "@/styles/ui";

type StepStatus = "completed" | "current" | "pending";

type Props = {
  routeId: string;
  title: string;
  subtitle: string;
  currentStep: "Review" | "Verify" | "Optimize" | "Drive" | "Summary";
  children: ReactNode;
};

const steps = ["Review", "Verify", "Optimize", "Drive", "Summary"] as const;

const heroStyle: CSSProperties = {
  ...ui.card.base,
  marginTop: 22,
  padding: 24,
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(135deg,#172033 0%,#111827 68%,rgba(234,88,12,0.2) 145%)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: "clamp(28px, 4vw, 44px)",
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const subtitleStyle: CSSProperties = {
  margin: "12px 0 0",
  maxWidth: 820,
  color: "#cbd5e1",
  fontSize: 16,
  lineHeight: 1.65,
  fontWeight: 650,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 20,
};

const contentCardStyle: CSSProperties = {
  ...ui.card.base,
  marginTop: 18,
  padding: 24,
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
};

function getStepStatus(
  step: Props["currentStep"],
  currentStep: Props["currentStep"],
): StepStatus {
  const stepIndex = steps.indexOf(step);
  const currentIndex = steps.indexOf(currentStep);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}

export function RouteProWorkflowShell({
  routeId,
  title,
  subtitle,
  currentStep,
  children,
}: Props) {
  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Importa gli stop. Controlla la rotta. Guida in modo più intelligente." />

      <div style={heroStyle}>
        <p style={eyebrowStyle}>RoutePro Workflow</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={subtitleStyle}>{subtitle}</p>

        <RouteProWorkflowHeader
          steps={[
            { label: "Import", status: "completed" },
            { label: "Extract", status: "completed" },
            { label: "Review", status: getStepStatus("Review", currentStep) },
            { label: "Verify", status: getStepStatus("Verify", currentStep) },
            { label: "Optimize", status: getStepStatus("Optimize", currentStep) },
            { label: "Drive", status: getStepStatus("Drive", currentStep) },
            { label: "Summary", status: getStepStatus("Summary", currentStep) },
          ]}
        />

        <div style={actionsStyle}>
          <Link
            href={`/app/routepro/${routeId}`}
            style={routeProUi.secondaryButton}
          >
            Vista classica
          </Link>

          <Link href="/app/routepro" style={routeProUi.secondaryButton}>
            Command Center
          </Link>
        </div>
      </div>

      <div style={contentCardStyle}>{children}</div>
    </section>
  );
}