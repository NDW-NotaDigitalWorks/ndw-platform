"use client";

import { useFormStatus } from "react-dom";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";

type Props = {
  idleLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
};

export function RouteProSubmitButton({
  idleLabel,
  pendingLabel = "Elaborazione...",
  variant = "primary",
}: Props) {
  const { pending } = useFormStatus();

  const baseStyle =
    variant === "danger"
      ? routeProUi.dangerButton
      : variant === "secondary"
        ? routeProUi.secondaryButton
        : routeProUi.primaryButton;

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        ...baseStyle,
        opacity: pending ? 0.65 : 1,
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}