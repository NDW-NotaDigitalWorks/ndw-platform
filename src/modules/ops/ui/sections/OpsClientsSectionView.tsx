import type { OpsSectionViewModel } from "@/modules/ops/domain/ops.view-models";
import OpsInteractiveEntityList from "../components/OpsInteractiveEntityList";
import OpsListSection from "../components/OpsListSection";

type Props = {
  section: OpsSectionViewModel;
};

export default function OpsAssetsSectionView({ section }: Props) {
  return (
    <OpsListSection
      title={section.title}
      subtitle={section.subtitle}
      primaryActionLabel="Nuovo task"
    >
      <OpsInteractiveEntityList
  entities={section.entities}
  emptyTitle={section.emptyState.title}
  emptyDescription={section.emptyState.description}
/>
    </OpsListSection>
  );
}