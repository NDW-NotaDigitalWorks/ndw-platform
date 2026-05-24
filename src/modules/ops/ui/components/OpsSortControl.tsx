"use client";

export type OpsSortMode =
  | "title-asc"
  | "title-desc";

type Props = {
  value: OpsSortMode;
  onChange: (value: OpsSortMode) => void;
};

export default function OpsSortControl({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as OpsSortMode)
      }
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        background: "#ffffff",
      }}
    >
      <option value="title-asc">
        Titolo A → Z
      </option>

      <option value="title-desc">
        Titolo Z → A
      </option>
    </select>
  );
}