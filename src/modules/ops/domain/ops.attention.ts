export type OpsAttentionSeverity =
  | "info"
  | "warning"
  | "critical";

export type OpsAttentionSourceType =
  | "item"
  | "activity"
  | "system";

export type OpsAttentionItem = {
  id: string;

  title: string;

  description: string;

  severity: OpsAttentionSeverity;

  priority: number;

  sourceType: OpsAttentionSourceType;

  sourceId?: string | null;

  createdAt: string;
};

export type OpsAttentionSummary = {
  total: number;
  critical: number;
  warning: number;
  info: number;
  healthy: boolean;
};