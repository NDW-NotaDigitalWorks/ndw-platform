"use client";

export type OpsViewMode = "cards" | "compact";

type Props = {
  value: OpsViewMode;
  onChange: (value: OpsViewMode) => void;
};

export default function OpsViewModeToggle({
  value,
  onChange,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 12px",
          background:
            value === "cards"
              ? "#111827"
              : "#ffffff",
          color:
            value === "cards"
              ? "#ffffff"
              : "#111827",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cards
      </button>

      <button
        type="button"
        onClick={() => onChange("compact")}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 12px",
          background:
            value === "compact"
              ? "#111827"
              : "#ffffff",
          color:
            value === "compact"
              ? "#ffffff"
              : "#111827",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Compact
      </button>
    </div>
  );
}