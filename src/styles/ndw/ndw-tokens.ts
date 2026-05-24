export const ndwTokens = {
  colors: {
    background: "#050B14",
    backgroundSoft: "#07111F",

    surface: "#08111F",
    surfaceSoft: "#0D1A2B",
    surfaceRaised: "#102238",
    surfaceOverlay: "#132B46",

    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",

    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#64748B",
    textInverse: "#020617",

    primary: "#1D9BF0",
    primarySoft: "rgba(29,155,240,0.14)",

    success: "#22C55E",
    successSoft: "rgba(34,197,94,0.14)",

    warning: "#F59E0B",
    warningSoft: "rgba(245,158,11,0.14)",

    danger: "#EF4444",
    dangerSoft: "rgba(239,68,68,0.14)",

    info: "#38BDF8",
    infoSoft: "rgba(56,189,248,0.14)",

    neutral: "#94A3B8",
    neutralSoft: "rgba(148,163,184,0.14)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 999,
  },

  shadows: {
    sm: "0 8px 24px rgba(0,0,0,0.18)",
    md: "0 16px 40px rgba(0,0,0,0.24)",
    lg: "0 24px 70px rgba(0,0,0,0.32)",
    accent: "0 0 32px rgba(29,155,240,0.18)",
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    sizes: {
      caption: 12,
      small: 13,
      body: 15,
      bodyLarge: 17,
      cardTitle: 18,
      sectionTitle: 22,
      pageTitle: 32,
      display: 48,
    },

    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },

    lineHeights: {
      tight: 1.05,
      snug: 1.2,
      normal: 1.5,
    },
  },

  layout: {
    pageMaxWidth: 1280,
    contentMaxWidth: 1120,
    narrowMaxWidth: 760,
    sidebarWidth: 280,
    mobileBreakpoint: 768,
  },

  zIndex: {
    base: 1,
    dropdown: 20,
    sticky: 30,
    modal: 50,
    toast: 60,
  },

  motion: {
    fast: "120ms ease-out",
    normal: "180ms ease-out",
    slow: "260ms ease-out",
  },
} as const;

export type NdwTokens = typeof ndwTokens;