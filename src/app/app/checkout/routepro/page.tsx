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

function isOwnerRole(
  role: string | null | undefined,
): boolean {
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
  const paymentComplete =
    params.payment === "complete";

  /*
   * Dopo il pagamento lasciamo visibile lo stato
   * di attivazione mentre aspettiamo il webhook.
   *
   * Prima del pagamento impediamo invece un nuovo
   * checkout a owner e utenti già attivi.
   */
  if (!paymentComplete) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
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

    const {
      data: entitlement,
      error: entitlementError,
    } = await supabase
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

        {paymentComplete ? (
          <>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 34,
                lineHeight: 1.1,
              }}
            >
              Attivazione
            </h1>

            <div style={{ marginTop: 28 }}>
              <RouteProActivationStatus />
            </div>

            <p
              style={{
                marginTop: 18,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              Puoi lasciare aperta questa pagina mentre
              completiamo l&apos;attivazione.
            </p>
          </>
        ) : (
          <div style={{ marginTop: 28 }}>
            <RouteProCheckoutClient
              email={user.email}
            />
          </div>
        )}
      </div>
    </main>
  );
}
