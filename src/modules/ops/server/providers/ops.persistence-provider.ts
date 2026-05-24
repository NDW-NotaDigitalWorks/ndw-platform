import { opsSupabaseRepository } from "../repositories/ops.supabase.repository";
import type { OpsRepository } from "../repositories/ops.repository.types";

export async function getOpsRepository(): Promise<OpsRepository> {
  return opsSupabaseRepository;
}

export async function getOpsWriteRepository(): Promise<OpsRepository> {
  return opsSupabaseRepository;
}