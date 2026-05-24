import type { OpsSectionViewModel } from "@/modules/ops/domain/ops.view-models";
import OpsCreateTaskForm from "../components/OpsCreateTaskForm";
import OpsInteractiveEntityList from "../components/OpsInteractiveEntityList";
import OpsListSection from "../components/OpsListSection";

type Props = {
  section: OpsSectionViewModel;
};

export default function OpsTasksSectionView({ section }: Props) {
  return (
    <OpsListSection
      title={section.title}
      subtitle={section.subtitle}
      primaryActionLabel="Nuovo task"
    >
      <div style={{ marginBottom: 22 }}>
        <OpsCreateTaskForm />
      </div>

      <OpsInteractiveEntityList
        entities={section.entities}
        emptyTitle={section.emptyState.title}
        emptyDescription={section.emptyState.description}
      />
    </OpsListSection>
  );
}