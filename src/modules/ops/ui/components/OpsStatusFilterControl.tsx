"use client";

export type OpsStatusFilterValue =
  | "all"
  | "draft"
  | "active"
  | "paused"
  | "completed";

type Props = {
  value: OpsStatusFilterValue;
  onChange: (value: OpsStatusFilterValue) => void;
};

export default function OpsStatusFilterControl({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as OpsStatusFilterValue)
      }
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        background: "#ffffff",
      }}
    >
      <option value="all">Tutti gli stati</option>
      <option value="draft">Draft</option>
      <option value="active">Active</option>
      <option value="paused">Paused</option>
      <option value="completed">Completed</option>
    </select>
  );
}