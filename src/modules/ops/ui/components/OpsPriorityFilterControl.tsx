"use client";

export type OpsPriorityFilterValue =
  | "all"
  | "low"
  | "medium"
  | "high"
  | "urgent";

type Props = {
  value: OpsPriorityFilterValue;
  onChange: (value: OpsPriorityFilterValue) => void;
};

export default function OpsPriorityFilterControl({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as OpsPriorityFilterValue)
      }
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        background: "#ffffff",
      }}
    >
      <option value="all">Tutte le priorità</option>
      <option value="low">Bassa</option>
      <option value="medium">Media</option>
      <option value="high">Alta</option>
      <option value="urgent">Urgente</option>
    </select>
  );
}