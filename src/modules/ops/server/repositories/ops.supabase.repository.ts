import { createClient } from "@/lib/supabase/server";

import type { OpsActivityEvent } from "@/modules/ops/domain/ops.events";
import type {
  CreateOpsTaskInput,
  UpdateOpsTaskStatusInput,
} from "@/modules/ops/domain/ops.inputs";

import type { OpsRepository } from "./ops.repository.types";

import {
  mapOpsActivityEventRow,
  mapOpsAssetRow,
  mapOpsClientRow,
  mapOpsSaleRow,
  mapOpsTaskRow,
  mapOpsWorkflowRow,
  type OpsSupabaseActivityEventRow,
  type OpsSupabaseItemRow,
} from "./ops.supabase.mappers";

async function getRowsByType(type: OpsSupabaseItemRow["type"]) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ndw_ops_items")
    .select("*")
    .eq("type", type)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[OPS_SUPABASE_REPOSITORY:${type}]`, error.message);
    return [];
  }

  return (data ?? []) as OpsSupabaseItemRow[];
}

export const opsSupabaseRepository: OpsRepository = {
  async getTasks() {
    const rows = await getRowsByType("task");
    return rows.map(mapOpsTaskRow);
  },

  async getTaskById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ndw_ops_items")
      .select("*")
      .eq("id", id)
      .eq("type", "task")
      .maybeSingle();

    if (error) {
      console.error("[OPS_SUPABASE_REPOSITORY:getTaskById]", error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapOpsTaskRow(data as OpsSupabaseItemRow);
  },

  async getAssets() {
    const rows = await getRowsByType("asset");
    return rows.map(mapOpsAssetRow);
  },

  async getClients() {
    const rows = await getRowsByType("client");
    return rows.map(mapOpsClientRow);
  },

  async getSales() {
    const rows = await getRowsByType("sale");
    return rows.map(mapOpsSaleRow);
  },

  async getWorkflows() {
    const rows = await getRowsByType("workflow");
    return rows.map(mapOpsWorkflowRow);
  },

  async createTask(input: CreateOpsTaskInput) {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Utente non autenticato.");
    }

    const { data, error } = await supabase
      .from("ndw_ops_items")
      .insert({
        user_id: user.id,
        type: "task",
        title: input.title,
        description: input.description ?? null,
        status: "active",
        priority: input.priority,
        due_at: input.dueAt ?? null,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error("Task creato ma ID non restituito.");
    }

    return data.id;
  },

  async updateTaskStatus(input: UpdateOpsTaskStatusInput) {
    const supabase = await createClient();

    const archivedAt =
      input.status === "archived" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("ndw_ops_items")
      .update({
        status: input.status,
        archived_at: archivedAt,
      })
      .eq("id", input.id)
      .eq("type", "task");

    if (error) {
      throw new Error(error.message);
    }
  },

  async createActivityEvent(
    event: Omit<OpsActivityEvent, "id" | "userId" | "createdAt">,
  ) {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Utente non autenticato.");
    }

    const { error } = await supabase.from("ndw_ops_activity_events").insert({
      user_id: user.id,
      workspace_id: event.workspaceId ?? null,
      item_id: event.itemId,
      item_type: event.itemType,
      event_type: event.eventType,
      title: event.title,
      description: event.description ?? null,
      from_status: event.fromStatus ?? null,
      to_status: event.toStatus ?? null,
      metadata: event.metadata ?? {},
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async getRecentActivityEvents() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ndw_ops_activity_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(
        "[OPS_SUPABASE_REPOSITORY:getRecentActivityEvents]",
        error.message,
      );

      return [];
    }

    return ((data ?? []) as OpsSupabaseActivityEventRow[]).map(
      mapOpsActivityEventRow,
    );
  },

  async getActivityEventsByItemId(itemId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ndw_ops_activity_events")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "[OPS_SUPABASE_REPOSITORY:getActivityEventsByItemId]",
        error.message,
      );

      return [];
    }

    return ((data ?? []) as OpsSupabaseActivityEventRow[]).map(
      mapOpsActivityEventRow,
    );
  },
};