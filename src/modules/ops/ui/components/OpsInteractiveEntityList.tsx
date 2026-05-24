"use client";

import { useMemo, useState } from "react";
import type { OpsEntityCardViewModel } from "@/modules/ops/domain/ops.view-models";
import OpsEntityCard from "./OpsEntityCard";
import OpsEmptyState from "./OpsEmptyState";
import OpsLocalSearchInput from "./OpsLocalSearchInput";
import OpsPriorityFilterControl, {
  type OpsPriorityFilterValue,
} from "./OpsPriorityFilterControl";
import OpsSortControl, { type OpsSortMode } from "./OpsSortControl";
import OpsStatusFilterControl, {
  type OpsStatusFilterValue,
} from "./OpsStatusFilterControl";
import OpsStickyControls from "./OpsStickyControls";
import OpsViewModeToggle, { type OpsViewMode } from "./OpsViewModeToggle";

type Props = {
  entities: OpsEntityCardViewModel[];
  emptyTitle: string;
  emptyDescription: string;
};

export default function OpsInteractiveEntityList({
  entities,
  emptyTitle,
  emptyDescription,
}: Props) {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<OpsSortMode>("title-asc");
  const [viewMode, setViewMode] = useState<OpsViewMode>("cards");
  const [statusFilter, setStatusFilter] =
    useState<OpsStatusFilterValue>("all");
  const [priorityFilter, setPriorityFilter] =
    useState<OpsPriorityFilterValue>("all");

  const hasActiveFilters =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const visibleEntities = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = entities.filter((entity) => {
      const title = entity.title.toLowerCase();
      const subtitle = entity.subtitle?.toLowerCase() ?? "";
      const statusLabel = entity.statusLabel.toLowerCase();

      const matchesSearch =
        title.includes(normalizedSearch) ||
        subtitle.includes(normalizedSearch) ||
        statusLabel.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || entity.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || entity.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "title-asc") {
        return a.title.localeCompare(b.title);
      }

      return b.title.localeCompare(a.title);
    });
  }, [entities, search, sortMode, statusFilter, priorityFilter]);

  return (
    <div>
      <OpsStickyControls>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <OpsLocalSearchInput value={search} onChange={setSearch} />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <OpsStatusFilterControl
              value={statusFilter}
              onChange={setStatusFilter}
            />

            <OpsPriorityFilterControl
              value={priorityFilter}
              onChange={setPriorityFilter}
            />

            <OpsSortControl value={sortMode} onChange={setSortMode} />
            <OpsViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </OpsStickyControls>

      {visibleEntities.length === 0 ? (
        <OpsEmptyState
          title={
            hasActiveFilters
              ? "Nessun risultato trovato"
              : emptyTitle
          }
          description={
            hasActiveFilters
              ? "Modifica ricerca o filtri per visualizzare altri elementi."
              : emptyDescription
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gap: viewMode === "cards" ? 14 : 8,
          }}
        >
          {visibleEntities.map((entity) => (
            <OpsEntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      )}
    </div>
  );
}