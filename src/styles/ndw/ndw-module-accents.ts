export const ndwModuleAccents = {
  core: {
    accent: "#1D9BF0",
    accentSoft: "rgba(29,155,240,0.14)",
    accentBorder: "rgba(29,155,240,0.28)",
    accentText: "#7DD3FC",
  },

  routepro: {
    accent: "#FF7A00",
    accentSoft: "rgba(255,122,0,0.14)",
    accentBorder: "rgba(255,122,0,0.24)",
    accentText: "#FDBA74",
  },

  ops: {
    accent: "#14B8A6",
    accentSoft: "rgba(20,184,166,0.14)",
    accentBorder: "rgba(20,184,166,0.24)",
    accentText: "#5EEAD4",
  },

  agenda: {
    accent: "#8B5CF6",
    accentSoft: "rgba(139,92,246,0.14)",
    accentBorder: "rgba(139,92,246,0.24)",
    accentText: "#C4B5FD",
  },
} as const;

export type NdwModuleKey = keyof typeof ndwModuleAccents;