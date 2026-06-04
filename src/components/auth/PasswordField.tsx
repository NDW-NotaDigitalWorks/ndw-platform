"use client";

import { useState } from "react";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type PasswordFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  minLength?: number;
};

export function PasswordField({
  label,
  name,
  required = true,
  minLength = 8,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label
      style={{
        display: "block",
        marginTop: 14,
        color: ndwTokens.colors.textSecondary,
        fontSize: ndwTokens.typography.sizes.small,
        fontWeight: ndwTokens.typography.weights.bold,
      }}
    >
      {label}

      <div style={{ position: "relative", marginTop: 8 }}>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          required={required}
          minLength={minLength}
          style={{
            width: "100%",
            minHeight: 48,
            padding: "0 88px 0 14px",
            borderRadius: ndwTokens.radius.md,
            border: `1px solid ${ndwTokens.colors.borderStrong}`,
            background: ndwTokens.colors.surfaceRaised,
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.body,
            boxSizing: "border-box",
          }}
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          style={{
            position: "absolute",
            top: "50%",
            right: 8,
            transform: "translateY(-50%)",
            minHeight: 34,
            padding: "0 10px",
            borderRadius: ndwTokens.radius.sm,
            border: `1px solid ${ndwTokens.colors.border}`,
            background: ndwTokens.colors.surface,
            color: ndwTokens.colors.textSecondary,
            fontSize: ndwTokens.typography.sizes.small,
            fontWeight: ndwTokens.typography.weights.bold,
            cursor: "pointer",
          }}
        >
          {showPassword ? "Nascondi" : "Mostra"}
        </button>
      </div>
    </label>
  );
}