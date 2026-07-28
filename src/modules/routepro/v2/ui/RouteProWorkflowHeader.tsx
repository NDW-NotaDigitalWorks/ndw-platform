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
  alignItems: "flex-start",
  width: "100%",
  marginTop: 22,
  padding: "4px 2px 2px",
  overflowX: "auto",
  scrollbarWidth: "thin",
};

const stepWrapperStyle: CSSProperties = {
  position: "relative",
  flex: "1 0 94px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: 94,
};

const stepTopStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 999,
  border: "2px solid transparent",
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 950,
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  marginTop: 7,
  fontSize: 11,
  lineHeight: 1.25,
  fontWeight: 850,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const connectorBaseStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  left: "calc(50% + 15px)",
  width: "calc(100% - 30px)",
  height: 2,
  borderRadius: 999,
};

function getCircleStyle(status: StepStatus): CSSProperties {
  if (status === "completed") {
    return {
      ...stepTopStyle,
      background: "#22c55e",
      color: "#052e16",
      borderColor: "rgba(134,239,172,0.72)",
      boxShadow: "0 0 18px rgba(34,197,94,0.32)",
    };
  }

  if (status === "current") {
    return {
      ...stepTopStyle,
      width: 34,
      height: 34,
      marginTop: -2,
      background: "#f97316",
      color: "#ffffff",
      borderColor: "#fdba74",
      boxShadow: "0 0 0 5px rgba(249,115,22,0.12)",
    };
  }

  return {
    ...stepTopStyle,
    background: "#1e293b",
    color: "#64748b",
    borderColor: "#475569",
  };
}

function getLabelStyle(status: StepStatus): CSSProperties {
  if (status === "completed") {
    return {
      ...labelStyle,
      color: "#86efac",
    };
  }

  if (status === "current") {
    return {
      ...labelStyle,
      color: "#ffffff",
      fontWeight: 950,
    };
  }

  return {
    ...labelStyle,
    color: "#64748b",
  };
}

function getConnectorStyle(
  status: StepStatus,
  nextStatus: StepStatus | undefined,
): CSSProperties {
  const isCompletedConnection =
    status === "completed" &&
    (nextStatus === "completed" || nextStatus === "current");

  return {
    ...connectorBaseStyle,
    background: isCompletedConnection
      ? "linear-gradient(90deg,#22c55e 0%,#4ade80 100%)"
      : "rgba(100,116,139,0.34)",
  };
}

function getPrefix(status: StepStatus): string {
  if (status === "completed") {
    return "✓";
  }

  if (status === "current") {
    return "●";
  }

  return "";
}

export function RouteProWorkflowHeader({ steps }: Props) {
  return (
    <div style={wrapperStyle} aria-label="Avanzamento workflow RoutePro">
      {steps.map((step, index) => {
        const nextStep = steps[index + 1];

        return (
          <div key={step.label} style={stepWrapperStyle}>
            {nextStep ? (
              <span
                aria-hidden="true"
                style={getConnectorStyle(
                  step.status,
                  nextStep.status,
                )}
              />
            ) : null}

            <span
              style={getCircleStyle(step.status)}
              aria-current={
                step.status === "current" ? "step" : undefined
              }
            >
              {getPrefix(step.status)}
            </span>

            <span style={getLabelStyle(step.status)}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}