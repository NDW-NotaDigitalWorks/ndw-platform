import { NdwMetricCard } from "@/components/ndw";

type Props = {
  label: string;
  value: string | number;
  helperText?: string;
};

export default function OpsMetricCard({
  label,
  value,
  helperText,
}: Props) {
  return (
    <NdwMetricCard
      label={label}
      value={value}
      description={helperText}
    />
  );
}