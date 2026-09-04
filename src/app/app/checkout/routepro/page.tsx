import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RouteProCheckoutClient from "./RouteProCheckoutClient";
import RouteProActivationStatus from "./RouteProActivationStatus";

const ROUTEPRO_MODULE_KEY = "routepro";

type RouteProCheckoutPageProps = {
  searchParams: Promise<{
    payment?: string;
  }>;
};

function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

export default async function RouteProCheckoutPage({
  searchParams,
}: RouteProCheckoutPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.email || !user.email_confirmed_at) {
    redirect("/login?verify-email=1");
  }

  const params = await searchParams;
  const paymentComplete = params.payment === "complete";

  /*
   * Dopo un pagamento dobbiamo lasciare visibile la pagina
   * di activation status: sarà lei ad aspettare il webhook.
   *
   * Prima del pagamento, invece, impediamo un nuovo checkout
   * a owner e utenti già attivi.
   */
  if (!paymentComplete) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(
        `RoutePro checkout profile lookup failed: ${profileError.message}`,
      );
    }

    if (!profile?.is_active) {
      redirect("/account-disabled");
    }

    if (isOwnerRole(profile.role)) {
      redirect("/app/routepro");
    }

    const { data: entitlement, error: entitlementError } = await supabase
      .from("module_entitlements")
      .select("provider,is_active")
      .eq("user_id", user.id)
      .eq("module_key", ROUTEPRO_MODULE_KEY)
      .maybeSingle();

    if (entitlementError) {
      throw new Error(
        `RoutePro checkout entitlement lookup failed: ${entitlementError.message}`,
      );
    }

    if (entitlement?.is_active === true) {
      redirect("/app/routepro");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#f8fafc",
        padding: "32px 16px 64px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#22c55e",
            fontWeight: 800,
          }}
        >
          RoutePro
        </p>

        <h1
          style={{
            margin: "8px 0 0",
            fontSize: 34,
            lineHeight: 1.1,
          }}
        >
          {paymentComplete
            ? "Attivazione"
            : "Founding Driver"}
        </h1>

        {!paymentComplete ? (
          <p
            style={{
              marginTop: 12,
              color: "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            €19,99 al mese. Prezzo riservato ai primi 100
            Founding Driver e mantenuto finché l&apos;abbonamento
            rimane attivo.
          </p>
        ) : null}

        <div style={{ marginTop: 28 }}>
          {paymentComplete ? (
            <RouteProActivationStatus />
          ) : (
            <div
              style={{
                padding: 20,
                borderRadius: 20,
                background: "#111827",
                border:
                  "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <RouteProCheckoutClient email={user.email} />
            </div>
          )}
        </div>

        <p
          style={{
            marginTop: 18,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          {paymentComplete
            ? "Puoi lasciare aperta questa pagina mentre completiamo l'attivazione."
            : "Pagamento sicuro. Il tuo account RoutePro rimane collegato al tuo profilo NDW."}
        </p>
      </div>
    </main>
  );
}
