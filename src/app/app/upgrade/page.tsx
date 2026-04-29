import Link from "next/link";
import { getPrimaryBillingPlanForModule } from "@/modules/billing/server/billing-config";
import { getModuleByKey } from "@/modules/registry/registry.queries";
import { notFound } from "next/navigation";

type UpgradePageProps = {
  searchParams: Promise<{
    module?: string;
  }>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const moduleKey = params.module ?? "routepro";

  const module = getModuleByKey(moduleKey);

  if (!module) {
    notFound();
  }

  const billingPlan = getPrimaryBillingPlanForModule(module.key);

  return (
    <section>
      <h1>Upgrade {module.name}</h1>

      <p style={{ color: "#64748b" }}>{module.description}</p>

      <div
        style={{
          marginTop: 24,
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "#ffffff",
          maxWidth: 560,
        }}
      >
        <h2>{billingPlan?.label ?? `${module.name} Access`}</h2>

        <p style={{ color: "#64748b" }}>
          Piano richiesto: {module.requiredPlan}
        </p>

        <p style={{ marginTop: 16 }}>
          Dopo il pagamento, l’accesso verrà attivato manualmente in questa fase
          di test. Successivamente collegheremo i webhook Whop per automatizzare
          tutto.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          {billingPlan?.checkoutUrl ? (
            <a
              href={billingPlan.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 10,
                background: "#0f172a",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              Vai al checkout
            </a>
          ) : (
            <p style={{ color: "#991b1b" }}>
              Checkout non ancora configurato per questo modulo.
            </p>
          )}

          <Link href="/app">Torna alla dashboard</Link>
        </div>
      </div>
    </section>
  );
}