import type { CSSProperties } from "react";
import { ui } from "@/styles/ui";

export const routeProUi = {
  shell: {
    ...ui.page.section,
  } satisfies CSSProperties,

  hero: {
    ...ui.card.base,
    padding: 28,
    background:
      "linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 55%, rgba(34, 197, 94, 0.18) 100%)",
    color: "#f9fafb",
    border: "1px solid rgba(148, 163, 184, 0.25)",
  } satisfies CSSProperties,

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  } satisfies CSSProperties,

  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 18,
  } satisfies CSSProperties,

  heroTitle: {
    margin: "18px 0 0",
    fontSize: 42,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    color: "#f9fafb",
  } satisfies CSSProperties,

  heroSubtitle: {
    margin: "14px 0 0",
    maxWidth: 720,
    fontSize: 16,
    lineHeight: 1.65,
    color: "#cbd5e1",
  } satisfies CSSProperties,

  primaryButton: {
    ...ui.button.primary,
    background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
    boxShadow: "0 10px 24px rgba(14, 165, 233, 0.22)",
  } satisfies CSSProperties,

  secondaryButton: {
    ...ui.button.secondary,
    borderColor: "rgba(14, 165, 233, 0.35)",
  } satisfies CSSProperties,

  dangerButton: {
    ...ui.button.danger,
  } satisfies CSSProperties,
};