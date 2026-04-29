import type { CSSProperties } from "react";
import { theme } from "@/styles/theme";

export const ui = {
  page: {
    section: {
      width: "100%",
    } satisfies CSSProperties,

    eyebrow: {
      margin: 0,
      fontSize: 13,
      fontWeight: 700,
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    } satisfies CSSProperties,

    title: {
      margin: "8px 0 0",
      fontSize: 34,
      lineHeight: 1.15,
      color: theme.colors.text,
    } satisfies CSSProperties,

    subtitle: {
      margin: "10px 0 0",
      fontSize: 16,
      color: theme.colors.textMuted,
    } satisfies CSSProperties,

    sectionTitle: {
      margin: "0 0 16px",
      fontSize: 22,
      color: theme.colors.text,
    } satisfies CSSProperties,
  },

  card: {
    base: {
      padding: 24,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 18,
      background: theme.colors.card,
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    } satisfies CSSProperties,
  },

  form: {
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: theme.colors.textSecondary,
    } satisfies CSSProperties,

    input: {
      width: "100%",
      marginTop: 6,
      padding: "10px 12px",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 10,
      fontSize: 14,
      color: theme.colors.text,
      background: theme.colors.card,
    } satisfies CSSProperties,
  },

  button: {
    primary: {
      padding: "10px 14px",
      border: "none",
      borderRadius: 10,
      background: theme.colors.primary,
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
    } satisfies CSSProperties,

    secondary: {
      padding: "9px 12px",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 10,
      background: theme.colors.card,
      color: theme.colors.textSecondary,
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    } satisfies CSSProperties,

    danger: {
      padding: "9px 12px",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 10,
      background: theme.colors.card,
      color: theme.colors.danger,
      fontWeight: 600,
      cursor: "pointer",
    } satisfies CSSProperties,
  },
};