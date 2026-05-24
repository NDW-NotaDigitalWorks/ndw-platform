import {
  OPS_DEMO_ASSETS,
  OPS_DEMO_CLIENTS,
  OPS_DEMO_TASKS,
  OPS_DEMO_WORKFLOWS,
} from "./ops.demo-data";

import type {
  OpsActivityFeedItemViewModel,
  OpsDashboardInsightViewModel,
  OpsDashboardMetricViewModel,
  OpsWorkspaceDashboardViewModel,
} from "./ops.view-models";

import { mapOpsAreasToDashboardViewModel } from "./ops.mappers";
import type { OpsAreaDefinition } from "./ops.types";

function buildMetrics(): OpsDashboardMetricViewModel[] {
  return [
    {
      label: "Tasks",
      value: OPS_DEMO_TASKS.length,
      helperText: "Attività operative monitorate.",
    },
    {
      label: "Assets",
      value: OPS_DEMO_ASSETS.length,
      helperText: "Risorse operative disponibili.",
    },
    {
      label: "Clients",
      value: OPS_DEMO_CLIENTS.length,
      helperText: "Clienti presenti nel workspace.",
    },
    {
      label: "Workflows",
      value: OPS_DEMO_WORKFLOWS.length,
      helperText: "Workflow attivi disponibili.",
    },
  ];
}

function buildInsights(): OpsDashboardInsightViewModel[] {
  return [
    {
      title: "Workflow operativo attivo",
      description:
        "Le sezioni principali del workspace sono già collegate alla dashboard.",
      tone: "success",
    },
    {
      title: "Client interaction layer attivo",
      description:
        "Ricerca locale, sorting e adaptive controls sono disponibili.",
      tone: "muted",
    },
    {
      title: "Foundation pronta per Supabase",
      description:
        "La UI è già separata da database e business logic.",
      tone: "warning",
    },
  ];
}

function buildActivityFeed(): OpsActivityFeedItemViewModel[] {
  return [
    {
      id: "activity_1",
      title: "Task operativo aggiornato",
      description: "Workflow onboarding cliente aggiornato.",
      timestampLabel: "2 min fa",
    },
    {
      id: "activity_2",
      title: "Nuovo asset disponibile",
      description: "Template contratto sincronizzato.",
      timestampLabel: "15 min fa",
    },
    {
      id: "activity_3",
      title: "Workspace status stabile",
      description: "Nessun alert operativo rilevato.",
      timestampLabel: "1h fa",
    },
  ];
}

export function buildOpsWorkspaceDashboardViewModel(
  areas: OpsAreaDefinition[],
): OpsWorkspaceDashboardViewModel {
  const dashboard = mapOpsAreasToDashboardViewModel(areas);

  return {
    title: dashboard.title,
    subtitle: dashboard.subtitle,

    metrics: buildMetrics(),
    insights: buildInsights(),
    activityFeed: buildActivityFeed(),
    attentionItems: [],
    attentionSummary: {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    healthy: true,
},
primaryAttentionItems: [],
secondaryAttentionItems: [],

    areas: dashboard.areas,
  };
}