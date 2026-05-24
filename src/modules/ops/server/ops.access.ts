import { userHasModuleAccess } from "@/modules/core/server/module-entitlements";

export async function userHasOpsAccess(): Promise<boolean> {
  return userHasModuleAccess("ops");
}