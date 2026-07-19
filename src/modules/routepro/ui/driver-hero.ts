import type { RouteProRouteSummary } from "@/modules/routepro/server/routepro.routes";

export type DriverHeroState = {
  badge: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  stateLabel: string;
};

export function getDriverHeroState(
  route: RouteProRouteSummary | null,
): DriverHeroState {
  if (!route) {
    return {
      badge: "Pronto a iniziare",
      title: "Prepara la prossima giornata",
      subtitle:
        "Crea una nuova rotta, importa gli stop e prepara il turno prima di partire.",
      primaryLabel: "Nuova rotta",
      primaryHref: "/app/routepro/new",
      secondaryLabel: "Tutte le rotte",
      secondaryHref: "/app/routepro/routes",
      stateLabel: "Nessun workflow attivo",
    };
  }

  if (route.status === "in_progress") {
    return {
      badge: "Guida in corso",
      title: route.name,
      subtitle:
        "La sessione di consegna è attiva. Riprendi la rotta dal punto in cui l’hai lasciata.",
      primaryLabel: "Riprendi guida",
      primaryHref: `/app/routepro/${route.id}/execute`,
      secondaryLabel: "Apri workflow",
      secondaryHref: `/app/routepro/${route.id}`,
      stateLabel: "Sessione attiva",
    };
  }

  if (route.status === "completed") {
    return {
      badge: "Completata",
      title: route.name,
      subtitle:
        "La giornata di consegna è terminata. Consulta il riepilogo della rotta.",
      primaryLabel: "Visualizza riepilogo",
      primaryHref: `/app/routepro/routes/${route.id}/summary`,
      secondaryLabel: "Nuova rotta",
      secondaryHref: "/app/routepro/new",
      stateLabel: "Giornata completata",
    };
  }

  if (route.is_optimized) {
    return {
      badge: "Pronta a partire",
      title: route.name,
      subtitle:
        "La rotta è ottimizzata. Puoi iniziare la sessione di guida.",
      primaryLabel: "Avvia percorso",
      primaryHref: `/app/routepro/${route.id}/execute`,
      secondaryLabel: "Apri workflow",
      secondaryHref: `/app/routepro/${route.id}`,
      stateLabel: "Rotta ottimizzata",
    };
  }

  return {
    badge: "Preparazione in corso",
    title: route.name,
    subtitle:
      "Completa i passaggi ancora necessari prima di ottimizzare e iniziare la guida.",
    primaryLabel: "Continua workflow",
    primaryHref: `/app/routepro/routes/${route.id}/review`,
    secondaryLabel: "Nuova rotta",
    secondaryHref: "/app/routepro/new",
    stateLabel: "Workflow da completare",
  };
}