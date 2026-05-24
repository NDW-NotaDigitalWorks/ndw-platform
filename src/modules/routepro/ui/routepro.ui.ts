import type { CSSProperties } from "react";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

const accent = ndwModuleAccents.routepro;

export const routeProUi = {
  shell: {
    maxWidth: ndwTokens.layout.pageMaxWidth,
    margin: "0 auto",
  } satisfies CSSProperties,

  hero: {
    padding: ndwTokens.spacing["3xl"],
    borderRadius: ndwTokens.radius["2xl"],
    background: `
      radial-gradient(circle at top right, ${accent.accentSoft} 0%, transparent 32%),
      linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)
    `,
    border: `1px solid ${accent.accentBorder}`,
    boxShadow: ndwTokens.shadows.md,
    color: ndwTokens.colors.textPrimary,
  } satisfies CSSProperties,

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: ndwTokens.spacing.md,
  } satisfies CSSProperties,

  logoMark: {
    width: 44,
    height: 44,
    borderRadius: ndwTokens.radius.lg,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: accent.accent,
    color: ndwTokens.colors.textPrimary,
    fontWeight: ndwTokens.typography.weights.black,
    fontSize: 18,
    boxShadow: "0 10px 24px rgba(255,122,0,0.22)",
  } satisfies CSSProperties,

  heroTitle: {
    margin: "20px 0 0",
    fontSize: 44,
    lineHeight: ndwTokens.typography.lineHeights.tight,
    letterSpacing: "-0.04em",
    color: ndwTokens.colors.textPrimary,
    fontWeight: ndwTokens.typography.weights.black,
  } satisfies CSSProperties,

  heroSubtitle: {
    margin: "14px 0 0",
    maxWidth: 760,
    fontSize: ndwTokens.typography.sizes.bodyLarge,
    lineHeight: ndwTokens.typography.lineHeights.normal,
    color: ndwTokens.colors.textSecondary,
  } satisfies CSSProperties,

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 18px",
    borderRadius: ndwTokens.radius.md,
    border: `1px solid ${accent.accent}`,
    background: accent.accent,
    color: ndwTokens.colors.textPrimary,
    fontSize: ndwTokens.typography.sizes.body,
    fontWeight: ndwTokens.typography.weights.black,
    textDecoration: "none",
    boxShadow: "0 10px 24px rgba(255,122,0,0.22)",
  } satisfies CSSProperties,

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 18px",
    borderRadius: ndwTokens.radius.md,
    border: `1px solid ${accent.accentBorder}`,
    background: ndwTokens.colors.surfaceRaised,
    color: ndwTokens.colors.textPrimary,
    fontSize: ndwTokens.typography.sizes.body,
    fontWeight: ndwTokens.typography.weights.bold,
    textDecoration: "none",
  } satisfies CSSProperties,

  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 18px",
    borderRadius: ndwTokens.radius.md,
    border: `1px solid ${ndwTokens.colors.danger}`,
    background: ndwTokens.colors.danger,
    color: ndwTokens.colors.textPrimary,
    fontSize: ndwTokens.typography.sizes.body,
    fontWeight: ndwTokens.typography.weights.black,
    textDecoration: "none",
  } satisfies CSSProperties,
};