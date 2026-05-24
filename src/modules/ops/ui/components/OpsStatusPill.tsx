import { NdwStatusPill } from "@/components/ndw";

type OpsStatusPillTone = "success" | "warning" | "muted" | "danger";

type Props = {
  label: string;
  tone?: OpsStatusPillTone;
};

function mapToneToVariant(tone: OpsStatusPillTone) {
  switch (tone) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "danger":
      return "danger";
    case "muted":
      return "neutral";
  }
}

export default function OpsStatusPill({ label, tone = "muted" }: Props) {
  return (
    <NdwStatusPill
      label={label}
      variant={mapToneToVariant(tone)}
    />
  );
}