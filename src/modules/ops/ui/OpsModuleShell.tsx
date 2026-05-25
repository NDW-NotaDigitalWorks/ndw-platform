import Link from "next/link";
import type { ReactNode } from "react";
import type { OpsNavigationContext } from "@/modules/ops/server/ops.navigation";
import { OPS_AREAS } from "@/modules/ops/registry/ops.registry";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import OpsAreaNavigation from "./components/OpsAreaNavigation";
import OpsContextBar from "./components/OpsContextBar";

type Props = {
  children: ReactNode;
  context?: OpsNavigationContext;
};

const opsAccent = ndwModuleAccents.ops;

export default function OpsModuleShell({ children, context }: Props) {
  return (
    <section
      style={{
        width: "100%",
        color: ndwTokens.colors.textPrimary,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: ndwTokens.spacing.lg,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: opsAccent.accentText,
              fontSize: ndwTokens.typography.sizes.small,
              fontWeight: ndwTokens.typography.weights.black,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            NDW Ops
          </p>

          <h1
            style={{
              margin: "10px 0 0",
              color: ndwTokens.colors.textPrimary,
              fontSize: ndwTokens.typography.sizes.pageTitle,
              fontWeight: ndwTokens.typography.weights.black,
              lineHeight: ndwTokens.typography.lineHeights.tight,
              letterSpacing: "-0.03em",
            }}
          >
            Ops Workspace
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              maxWidth: ndwTokens.layout.narrowMaxWidth,
              color: ndwTokens.colors.textSecondary,
              fontSize: ndwTokens.typography.sizes.bodyLarge,
              lineHeight: ndwTokens.typography.lineHeights.normal,
            }}
          >
            Sistema operativo modulare per workflow, organizzazione e
            micro-business.
          </p>
        </div>

        <Link
          href="/app"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            padding: "0 16px",
            borderRadius: ndwTokens.radius.md,
            border: `1px solid ${ndwTokens.colors.borderStrong}`,
            background: ndwTokens.colors.surfaceRaised,
            color: ndwTokens.colors.textPrimary,
            fontSize: ndwTokens.typography.sizes.body,
            fontWeight: ndwTokens.typography.weights.bold,
            textDecoration: "none",
          }}
        >
          Torna al Core
        </Link>
      </div>

      <div style={{ marginTop: ndwTokens.spacing["2xl"] }}>
        <OpsAreaNavigation
          areas={OPS_AREAS}
          currentAreaKey={context?.currentAreaKey}
        />
      </div>

      {context ? <OpsContextBar context={context} /> : null}

      <div
        style={{
          marginTop: ndwTokens.spacing["2xl"],
          borderTop: `1px solid ${ndwTokens.colors.borderStrong}`,
          paddingTop: ndwTokens.spacing["2xl"],
        }}
      >
        {children}
      </div>
    </section>
  );
}