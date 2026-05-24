"use client";

import { useFormStatus } from "react-dom";
import OpsActionButton from "./OpsActionButton";

type Props = {
  label: string;
  pendingLabel?: string;
};

export default function OpsSubmitActionButton({
  label,
  pendingLabel = "Aggiorno...",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <OpsActionButton
      label={pending ? pendingLabel : label}
      variant={pending ? "disabled" : "secondary"}
      buttonType="submit"
    />
  );
}