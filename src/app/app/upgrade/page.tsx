import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  NdwActionBar,
  NdwButton,
  NdwCard,
  NdwStatusPill,
} from "@/components/ndw";
import { createClient } from "@/lib/supabase/server";
import { getPrimaryBillingPlanForModule } from "@/modules/billing/server/billing-config";
import { getModuleByKey } from "@/modules/registry/registry.queries";
import { hasRouteProFounderAvailability } from "@/modules/routepro/server/routepro-founder";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type UpgradePageProps = {
  searchParams: Promise<{
    module?: string;
  }>;
};

type RouteProOffer =
  | "founding_driver"
  | "standard";

function getModuleAccent(moduleKey: string) {
  return (
    ndwModuleAccents[
      moduleKey as keyof typeof ndwModuleAccents
    ] ?? ndwModuleAccents.core
  );
}

export default async function UpgradePage({
  searchParams,
}: UpgradePageProps) {
  const params = await searchParams;
  const moduleKey = params.module ?? "agenda";

  const moduleDefinition =
    getModuleByKey(moduleKey);

  if (!moduleDefinition) {
    notFound();
  }

  const billingPlan =
    getPrimaryBillingPlanForModule(
      moduleDefinition.key,
    );

  const accent =
    getModuleAccent(moduleDefinition.key);

  const isRoutePro =
    moduleDefinition.key === "routepro";

  let routeProOffer: RouteProOffer | null =
    null;

  let routeProWasPaid = false;

  if (isRoutePro) {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const {
      data: entitlement,
      error: entitlementError,
    } = await supabase
      .from("module_entitlements")
      .select(
        "is_active,has_had_paid_access",
      )
      .eq("user_id", user.id)
      .eq("module_key", "routepro")
      .maybeSingle();

    if (entitlementError) {
      throw new Error(
        `RoutePro upgrade entitlement lookup failed: ${entitlementError.message}`,
      );
    }

    if (entitlement?.is_active === true) {
      redirect("/app/routepro");
    }

    routeProWasPaid =
      entitlement?.has_had_paid_access === true;

    routeProOffer = "standard";

    if (!routeProWasPaid) {
      const founderAvailable =
        await hasRouteProFounderAvailability();

      if (founderAvailable) {
        routeProOffer = "founding_driver";
      }
    }
  }

  const routeProIsFounder =
    routeProOffer === "founding_driver";

  const routeProActionLabel =
    routeProWasPaid
      ? "Riattiva RoutePro"
      : "Attiva RoutePro";

  const cardTitle = isRoutePro
    ? routeProIsFounder
      ? "RoutePro Founding Driver"
      : "RoutePro Standard"
    : billingPlan?.label ??
      `${moduleDefinition.name} Access`;

  const cardSubtitle = isRoutePro
    ? routeProWasPaid
      ? "Riattiva RoutePro e torna subito al tuo ambiente operativo."
      : "Attiva RoutePro e continua dal tuo ambiente operativo."
    : `Completa l'upgrade per abilitare ${moduleDefinition.name} nel tuo workspace NDW.`;

  const routeProPriceText =
    routeProIsFounder
      ? "Founding Driver: €19,99 al mese. Prezzo riservato ai primi 100 utenti e mantenuto finché l'abbonamento rimane attivo."
      : "RoutePro Standard: €29,99 al mese.";

  return (
    <section
      style={{
        maxWidth:
          ndwTokens.layout.contentMaxWidth,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: 0,
          color: accent.accentText,
          fontSize:
            ndwTokens.typography.sizes.small,
          fontWeight:
            ndwTokens.typography.weights.black,
          textTransform: "uppercase",
          letterSpacing: 1.2,
        }}
      >
        Upgrade
      </p>

      <div
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius:
            ndwTokens.radius.full,
          border: `1px solid ${accent.accentBorder}`,
          background: accent.accentSoft,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: accent.accent,
            boxShadow: `0 0 16px ${accent.accent}`,
          }}
        />

        <span
          style={{
            color: accent.accentText,
            fontSize:
              ndwTokens.typography.sizes.small,
            fontWeight:
              ndwTokens.typography.weights.black,
            letterSpacing: 0.3,
          }}
        >
          {moduleDefinition.name} Module
        </span>
      </div>

      <h1
        style={{
          margin: "14px 0 0",
          color:
            ndwTokens.colors.textPrimary,
          fontSize:
            ndwTokens.typography.sizes.pageTitle,
          fontWeight:
            ndwTokens.typography.weights.black,
          lineHeight:
            ndwTokens.typography.lineHeights
              .tight,
          letterSpacing: "-0.03em",
        }}
      >
        {isRoutePro
          ? routeProActionLabel
          : `Sblocca ${moduleDefinition.name}`}
      </h1>

      <p
        style={{
          margin: "12px 0 0",
          maxWidth:
            ndwTokens.layout.narrowMaxWidth,
          color:
            ndwTokens.colors.textSecondary,
          fontSize:
            ndwTokens.typography.sizes
              .bodyLarge,
          lineHeight:
            ndwTokens.typography.lineHeights
              .normal,
        }}
      >
        {isRoutePro
          ? "Continua a creare, ottimizzare ed eseguire le tue rotte direttamente dal tuo workspace NDW."
          : moduleDefinition.description}
      </p>

      <div
        style={{
          marginTop:
            ndwTokens.spacing["3xl"],
          maxWidth: 720,
        }}
      >
        <NdwCard
          title={cardTitle}
          subtitle={cardSubtitle}
        >
          <div
            style={{
              display: "grid",
              gap: ndwTokens.spacing.lg,
            }}
          >
            <div
              style={{
                padding:
                  ndwTokens.spacing.lg,
                borderRadius:
                  ndwTokens.radius.xl,
                border: `1px solid ${accent.accentBorder}`,
                background:
                  accent.accentSoft,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color:
                    accent.accentText,
                  fontSize:
                    ndwTokens.typography
                      .sizes.body,
                  fontWeight:
                    ndwTokens.typography
                      .weights.bold,
                  lineHeight:
                    ndwTokens.typography
                      .lineHeights.normal,
                }}
              >
                {isRoutePro
                  ? routeProPriceText
                  : `Questo modulo fa parte dell'ecosistema operativo NDW ed è integrato direttamente nel tuo workspace personale.`}
              </p>
            </div>

            <div>
              <NdwStatusPill
                label={
                  isRoutePro
                    ? "Accesso non attivo"
                    : "Modulo bloccato"
                }
                variant="warning"
              />
            </div>

            {isRoutePro ? (
              <>
                <p
                  style={{
                    margin: 0,
                    color:
                      ndwTokens.colors
                        .textSecondary,
                    fontSize:
                      ndwTokens.typography
                        .sizes.body,
                    lineHeight:
                      ndwTokens.typography
                        .lineHeights.normal,
                  }}
                >
                  L&apos;attivazione è
                  automatica dopo la conferma
                  del pagamento.
                </p>

                <p
                  style={{
                    margin: 0,
                    color:
                      ndwTokens.colors
                        .textMuted,
                    fontSize:
                      ndwTokens.typography
                        .sizes.body,
                    lineHeight:
                      ndwTokens.typography
                        .lineHeights.normal,
                  }}
                >
                  Il tuo abbonamento viene
                  collegato direttamente al tuo
                  account NDW.
                </p>

                <NdwActionBar align="left">
                  <Link
                    href="/app/checkout/routepro"
                    style={{
                      display:
                        "inline-flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      minHeight: 42,
                      padding: "0 16px",
                      borderRadius:
                        ndwTokens.radius.md,
                      background:
                        accent.accent,
                      border: `1px solid ${accent.accent}`,
                      color:
                        ndwTokens.colors
                          .textPrimary,
                      textDecoration: "none",
                      fontSize:
                        ndwTokens.typography
                          .sizes.body,
                      fontWeight:
                        ndwTokens.typography
                          .weights.black,
                    }}
                  >
                    {routeProActionLabel}
                  </Link>

                  <Link
                    href="/app"
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <NdwButton variant="secondary">
                      Torna alla dashboard
                    </NdwButton>
                  </Link>
                </NdwActionBar>
              </>
            ) : billingPlan?.checkoutUrl ? (
              <>
                <p
                  style={{
                    margin: 0,
                    color:
                      ndwTokens.colors
                        .textSecondary,
                    fontSize:
                      ndwTokens.typography
                        .sizes.body,
                    lineHeight:
                      ndwTokens.typography
                        .lineHeights.normal,
                  }}
                >
                  Piano richiesto:{" "}
                  <strong
                    style={{
                      color:
                        ndwTokens.colors
                          .textPrimary,
                    }}
                  >
                    {
                      moduleDefinition.requiredPlan
                    }
                  </strong>
                </p>

                <NdwActionBar align="left">
                  <a
                    href={
                      billingPlan.checkoutUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display:
                        "inline-flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      minHeight: 42,
                      padding: "0 16px",
                      borderRadius:
                        ndwTokens.radius.md,
                      background:
                        accent.accent,
                      border: `1px solid ${accent.accent}`,
                      color:
                        ndwTokens.colors
                          .textPrimary,
                      textDecoration: "none",
                      fontSize:
                        ndwTokens.typography
                          .sizes.body,
                      fontWeight:
                        ndwTokens.typography
                          .weights.black,
                    }}
                  >
                    Vai al checkout
                  </a>

                  <Link
                    href="/app"
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <NdwButton variant="secondary">
                      Torna alla dashboard
                    </NdwButton>
                  </Link>
                </NdwActionBar>
              </>
            ) : (
              <NdwActionBar align="left">
                <p
                  style={{
                    margin: 0,
                    color:
                      ndwTokens.colors.danger,
                    fontWeight:
                      ndwTokens.typography
                        .weights.bold,
                  }}
                >
                  Checkout non ancora
                  configurato per questo modulo.
                </p>

                <Link
                  href="/app"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <NdwButton variant="secondary">
                    Torna alla dashboard
                  </NdwButton>
                </Link>
              </NdwActionBar>
            )}
          </div>
        </NdwCard>
      </div>
    </section>
  );
}
