import type { OpsAreaStatus } from "./ops.states";
import type {
  OpsAttentionItem,
  OpsAttentionSummary,
} from "./ops.attention";

export type OpsAreaViewModel = {
  key: string;

  title: string;
  description: string;

  href: string;

  status: OpsAreaStatus;

  badgeLabel: string;
};

export type OpsDashboardViewModel = {
  title: string;
  subtitle: string;

  areas: OpsAreaViewModel[];
};

export type OpsEntityCardViewModel = {
  id: string;

  entityType: string;
  status: string;
  priority?: string | null;

  title: string;
  subtitle?: string | null;

  statusLabel: string;

  href?: string;
};

export type OpsSectionMetricViewModel = {
  label: string;
  value: string | number;
  helperText?: string;
};

export type OpsSectionEmptyStateViewModel = {
  title: string;
  description: string;
};

export type OpsSectionViewModel = {
  title: string;
  subtitle: string;

  metrics: OpsSectionMetricViewModel[];

  entities: OpsEntityCardViewModel[];

  emptyState: OpsSectionEmptyStateViewModel;
};

export type OpsDashboardMetricViewModel = {
  label: string;
  value: string | number;
  helperText?: string;
};

export type OpsDashboardInsightViewModel = {
  title: string;
  description: string;
  tone: "success" | "warning" | "muted";
};

export type OpsActivityFeedItemViewModel = {
  id: string;
  title: string;
  description: string;
  timestampLabel: string;
};

export type OpsWorkspaceDashboardViewModel = {
  title: string;
  subtitle: string;

  metrics: OpsDashboardMetricViewModel[];
  insights: OpsDashboardInsightViewModel[];
  activityFeed: OpsActivityFeedItemViewModel[];
  attentionItems: OpsAttentionItem[];
  attentionSummary: OpsAttentionSummary;
  primaryAttentionItems: OpsAttentionItem[];
  secondaryAttentionItems: OpsAttentionItem[];

  areas: OpsAreaViewModel[];
};

export type OpsTimelineItemViewModel = {
  id: string;
  title: string;
  description: string;
  timestampLabel: string;
  eventType: string;
};

export type OpsEntityDetailMetaViewModel = {
  label: string;
  value: string | number;
};

export type OpsEntityDetailViewModel = {
  id: string;

  entityType: string;
  title: string;
  description?: string | null;

  status: string;
  statusLabel: string;

  primaryMeta: OpsEntityDetailMetaViewModel[];
  secondaryMeta: OpsEntityDetailMetaViewModel[];

  timeline: OpsTimelineItemViewModel[];
};