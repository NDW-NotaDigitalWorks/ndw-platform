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

const actionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18,
};

const cardStyle: CSSProperties = {
  ...ui.card.base,
  marginTop: 24,
};

const steps = ["Review", "Verify", "Optimize", "Drive", "Summary"] as const;

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
      <RouteProHeader subtitle="Import your stops. Review your route. Drive smarter." />

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

      <p style={ui.page.eyebrow}>RoutePro Workflow</p>
      <h1 style={ui.page.title}>{title}</h1>
      <p style={ui.page.subtitle}>{subtitle}</p>

      <div style={actionsStyle}>
        <Link href={`/app/routepro/${routeId}`} style={routeProUi.secondaryButton}>
          Classic route view
        </Link>

        <Link href="/app/routepro" style={routeProUi.secondaryButton}>
          Command Center
        </Link>
      </div>

      <div style={cardStyle}>{children}</div>
    </section>
  );
}