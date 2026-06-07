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
  border: "1px solid #cbd5e1",
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#1d4ed8",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(28px, 4vw, 44px)",
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  margin: "12px 0 0",
  maxWidth: 760,
  fontSize: 16,
  lineHeight: 1.65,
  fontWeight: 600,
  color: "#334155",
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
  border: "1px solid #cbd5e1",
  background: "#ffffff",
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
      <RouteProHeader subtitle="Import your stops. Review your route. Drive smarter." />

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
          <Link href={`/app/routepro/${routeId}`} style={routeProUi.secondaryButton}>
            Classic route view
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