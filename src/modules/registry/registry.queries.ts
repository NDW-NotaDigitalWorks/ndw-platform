import { MODULES } from "./config";

export function getEnabledModules() {
  return MODULES.filter((module) => module.isEnabled);
}

export function getModuleByKey(moduleKey: string) {
  return MODULES.find(
    (module) => module.key === moduleKey && module.isEnabled
  );
}