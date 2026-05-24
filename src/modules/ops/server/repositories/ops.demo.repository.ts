import {
  OPS_DEMO_ASSETS,
  OPS_DEMO_CLIENTS,
  OPS_DEMO_SALES,
  OPS_DEMO_TASKS,
  OPS_DEMO_WORKFLOWS,
} from "@/modules/ops/domain/ops.demo-data";

import type { OpsRepository } from "./ops.repository.types";

export const opsDemoRepository: OpsRepository = {
  async getTasks() {
    return OPS_DEMO_TASKS;
  },

  async getTaskById(id: string) {
  return OPS_DEMO_TASKS.find((task) => task.id === id) ?? null;
},

  async getAssets() {
    return OPS_DEMO_ASSETS;
  },

  async getClients() {
    return OPS_DEMO_CLIENTS;
  },

  async getSales() {
    return OPS_DEMO_SALES;
  },

  async getWorkflows() {
    return OPS_DEMO_WORKFLOWS;
  },

  async createTask() {
  console.warn(
    "[OPS_DEMO_REPOSITORY] createTask chiamato in modalità demo. Nessun dato salvato.",
  );

  return "demo_task_id";
},

async updateTaskStatus() {
  console.warn(
    "[OPS_DEMO_REPOSITORY] updateTaskStatus chiamato in modalità demo. Nessun dato aggiornato.",
  );
},

async createActivityEvent() {
  console.warn(
    "[OPS_DEMO_REPOSITORY] createActivityEvent chiamato in modalità demo. Nessun evento salvato.",
  );
},

async getRecentActivityEvents() {
  return [];
},

async getActivityEventsByItemId() {
  return [];
},
};