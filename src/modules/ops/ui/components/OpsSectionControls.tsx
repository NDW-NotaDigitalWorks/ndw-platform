import OpsActionBar from "./OpsActionBar";
import OpsActionButton from "./OpsActionButton";

type Props = {
  primaryActionLabel?: string;
};

export default function OpsSectionControls({
  primaryActionLabel = "Nuovo elemento",
}: Props) {
  return (
    <OpsActionBar>
      <OpsActionButton
        label={primaryActionLabel}
        variant="primary"
      />

      <OpsActionButton
        label="Filtri"
        variant="secondary"
      />

      <OpsActionButton
        label="Ordinamento"
        variant="secondary"
      />
    </OpsActionBar>
  );
}