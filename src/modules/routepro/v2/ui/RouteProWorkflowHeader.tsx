import type { CSSProperties } from "react";

type StepStatus = "completed" | "current" | "pending";

type WorkflowStep = {
  label: string;
  status: StepStatus;
};

type Props = {
  steps: WorkflowStep[];
};

const wrapperStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
  marginTop: 24,
  marginBottom: 24,
};

const baseStepStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "10px 14px",
  borderRadius: 14,
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  border: "1px solid transparent",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
};

function getStyle(status: StepStatus): CSSProperties {
  if (status === "completed") {
    return {
      ...baseStepStyle,
      background: "#14532d",
      color: "#ffffff",
      borderColor: "#166534",
    };
  }

  if (status === "current") {
    return {
      ...baseStepStyle,
      background: "#1d4ed8",
      color: "#ffffff",
      borderColor: "#2563eb",
      boxShadow: "0 14px 30px rgba(37, 99, 235, 0.25)",
    };
  }

  return {
    ...baseStepStyle,
    background: "#ffffff",
    color: "#334155",
    borderColor: "#cbd5e1",
  };
}

function getPrefix(status: StepStatus) {
  if (status === "completed") return "✓";
  if (status === "current") return "●";
  return "○";
}

export function RouteProWorkflowHeader({ steps }: Props) {
  return (
    <div style={wrapperStyle} aria-label="RoutePro workflow progress">
      {steps.map((step) => (
        <div key={step.label} style={getStyle(step.status)}>
          <span style={{ marginRight: 8 }}>{getPrefix(step.status)}</span>
          {step.label}
        </div>
      ))}
    </div>
  );
}