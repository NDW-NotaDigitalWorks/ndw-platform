import type {
  OpsAsset,
  OpsClient,
  OpsSale,
  OpsTask,
  OpsWorkflow,
} from "./ops.entities";

export const OPS_DEMO_TASKS: OpsTask[] = [
  {
    id: "task_demo_1",
    type: "task",
    workspaceId: "workspace_demo",
    title: "Preparare onboarding cliente",
    description: "Creazione checklist iniziale cliente.",
    status: "active",
    priority: "high",
    dueAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_demo_2",
    type: "task",
    workspaceId: "workspace_demo",
    title: "Aggiornare workflow operativo",
    description: "Review processi interni Ops.",
    status: "draft",
    priority: "medium",
    dueAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const OPS_DEMO_ASSETS: OpsAsset[] = [
  {
    id: "asset_demo_1",
    type: "asset",
    workspaceId: "workspace_demo",
    title: "Template contratto",
    description: "Template standard PDF.",
    status: "active",
    assetType: "template",
    url: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const OPS_DEMO_CLIENTS: OpsClient[] = [
  {
    id: "client_demo_1",
    type: "client",
    workspaceId: "workspace_demo",
    title: "Mario Rossi",
    description: "Cliente demo Ops.",
    status: "active",
    email: "mario@example.com",
    phone: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const OPS_DEMO_SALES: OpsSale[] = [
  {
    id: "sale_demo_1",
    type: "sale",
    workspaceId: "workspace_demo",
    title: "Vendita pacchetto premium",
    description: "Vendita demo area sales.",
    status: "completed",
    amountCents: 19900,
    currency: "EUR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const OPS_DEMO_WORKFLOWS: OpsWorkflow[] = [
  {
    id: "workflow_demo_1",
    type: "workflow",
    workspaceId: "workspace_demo",
    title: "Workflow onboarding cliente",
    description: "Sequenza operativa iniziale.",
    status: "active",
    triggerType: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];