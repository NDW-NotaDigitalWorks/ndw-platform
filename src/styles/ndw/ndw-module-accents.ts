export const ndwModuleAccents = {
  core: {
    accent: "#1D9BF0",
    accentHighlight: "#38BDF8",
    accentSoft: "rgba(29,155,240,0.14)",
    accentBorder: "rgba(29,155,240,0.28)",
    accentText: "#7DD3FC",
  },

  routepro: {
    accent: "#FF7A00",
    accentHighlight: "#FF9A3D",
    accentSoft: "rgba(255,122,0,0.14)",
    accentBorder: "rgba(255,122,0,0.24)",
    accentText: "#FF9A3D",
  },

  ops: {
    accent: "#14B8A6",
    accentHighlight: "#2DD4BF",
    accentSoft: "rgba(20,184,166,0.14)",
    accentBorder: "rgba(20,184,166,0.24)",
    accentText: "#5EEAD4",
  },

  agenda: {
    accent: "#8B5CF6",
    accentHighlight: "#A78BFA",
    accentSoft: "rgba(139,92,246,0.14)",
    accentBorder: "rgba(139,92,246,0.24)",
    accentText: "#C4B5FD",
  },
} as const;

export type NdwModuleKey = keyof typeof ndwModuleAccents;