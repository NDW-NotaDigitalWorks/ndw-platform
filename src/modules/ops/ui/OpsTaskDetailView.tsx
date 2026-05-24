import Link from "next/link";
import type { OpsEntityDetailViewModel } from "@/modules/ops/domain/ops.view-models";
import { ui } from "@/styles/ui";
import { theme } from "@/styles/theme";
import OpsStatusPill from "./components/OpsStatusPill";
import OpsTaskStatusActions from "./components/OpsTaskStatusActions";
import OpsTimeline from "./components/OpsTimeline";

type Props = {
  detail: OpsEntityDetailViewModel;
};

export default function OpsTaskDetailView({ detail }: Props) {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={ui.card.base}>
        <Link href="/app/ops/tasks" style={ui.button.secondary}>
          ← Torna ai task
        </Link>

        <div style={{ marginTop: 22 }}>
          <OpsStatusPill label={detail.statusLabel} tone="muted" />

          <h2
            style={{
              margin: "14px 0 0",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            {detail.title}
          </h2>

          {detail.description ? (
            <p
              style={{
                marginTop: 12,
                color: theme.colors.textMuted,
                lineHeight: 1.7,
              }}
            >
              {detail.description}
            </p>
          ) : null}
        </div>
      </div>

      <div style={ui.card.base}>
        <h2 style={ui.page.sectionTitle}>Dettagli operativi</h2>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {[...detail.primaryMeta, ...detail.secondaryMeta].map((meta) => (
            <div key={meta.label}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: theme.colors.textMuted,
                }}
              >
                {meta.label}
              </p>

              <p
                style={{
                  margin: "6px 0 0",
                  fontWeight: 800,
                }}
              >
                {meta.value}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <OpsTaskStatusActions
            entity={{
              id: detail.id,
              entityType: detail.entityType,
              status: detail.status,
              title: detail.title,
              subtitle: detail.description ?? null,
              statusLabel: detail.statusLabel,
            }}
          />
        </div>
      </div>

      <OpsTimeline items={detail.timeline} />
    </div>
  );
}