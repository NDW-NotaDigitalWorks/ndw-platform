import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrimaryBillingPlanForModule } from "@/modules/billing/server/billing-config";
import { getModuleByKey } from "@/modules/registry/registry.queries";
import { theme } from "@/styles/theme";
import { ui } from "@/styles/ui";

type UpgradePageProps = {
  searchParams: Promise<{
    module?: string;
  }>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const moduleKey = params.module ?? "agenda";

  const module = getModuleByKey(moduleKey);

  if (!module) {
    notFound();
  }

  const billingPlan = getPrimaryBillingPlanForModule(module.key);

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>Upgrade</p>
      <h1 style={ui.page.title}>Sblocca {module.name}</h1>
      <p style={ui.page.subtitle}>{module.description}</p>

      <div style={{ marginTop: 32, maxWidth: 620, ...ui.card.base }}>
        <h2 style={ui.page.sectionTitle}>
          {billingPlan?.label ?? `${module.name} Access`}
        </h2>

        <p style={{ color: theme.colors.textMuted, lineHeight: 1.7 }}>
          Piano richiesto:{" "}
          <strong style={{ color: theme.colors.text }}>
            {module.requiredPlan}
          </strong>
        </p>

        <p style={{ marginTop: 16, color: theme.colors.textMuted, lineHeight: 1.7 }}>
          Dopo il pagamento, l’accesso verrà attivato manualmente in questa fase
          di test. Successivamente collegheremo i webhook Whop per automatizzare
          tutto.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {billingPlan?.checkoutUrl ? (
            <a
              href={billingPlan.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              style={ui.button.primary}
            >
              Vai al checkout
            </a>
          ) : (
            <p style={{ color: theme.colors.danger, fontWeight: 700 }}>
              Checkout non ancora configurato per questo modulo.
            </p>
          )}

          <Link href="/app" style={ui.button.secondary}>
            Torna alla dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}