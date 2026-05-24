"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OpsLocalSearchInput({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      value={value}
      placeholder="Cerca elementi..."
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: "100%",
        maxWidth: 280,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        outline: "none",
      }}
    />
  );
}