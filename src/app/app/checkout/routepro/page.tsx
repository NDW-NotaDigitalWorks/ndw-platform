import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RouteProCheckoutClient from "./RouteProCheckoutClient";
import RouteProActivationStatus from "./RouteProActivationStatus";

type RouteProCheckoutPageProps = {
  searchParams: Promise<{
    payment?: string;
  }>;
};

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
            Founding Driver e mantenuto finché l'abbonamento
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