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
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 24,
  marginBottom: 24,
};

function getStyle(status: StepStatus): CSSProperties {
  if (status === "completed") {
    return {
      padding: "8px 14px",
      borderRadius: 999,
      background: "#dcfce7",
      color: "#166534",
      fontWeight: 700,
    };
  }

  if (status === "current") {
    return {
      padding: "8px 14px",
      borderRadius: 999,
      background: "#dbeafe",
      color: "#1d4ed8",
      fontWeight: 700,
    };
  }

  return {
    padding: "8px 14px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 700,
  };
}

export function RouteProWorkflowHeader({ steps }: Props) {
  return (
    <div style={wrapperStyle}>
      {steps.map((step) => (
        <div key={step.label} style={getStyle(step.status)}>
          {step.label}
        </div>
      ))}
    </div>
  );
}