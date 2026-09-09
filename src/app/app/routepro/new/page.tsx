import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { RouteProNewRouteWorkflowClient } from "@/modules/routepro/ui/RouteProNewRouteWorkflowClient";
import { ui } from "@/styles/ui";

export default async function RouteProNewRoutePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const [
    { data: profile, error: profileError },
    { data: entitlement, error: entitlementError },
    { data: trial, error: trialError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("module_entitlements")
      .select("provider,is_active,has_had_paid_access")
      .eq("user_id", user.id)
      .eq("module_key", "routepro")
      .maybeSingle(),

    supabase
      .from("routepro_trials")
      .select("expires_at,routes_used,routes_limit,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profileError) {
    throw new Error(
      `RoutePro profile lookup failed: ${profileError.message}`,
    );
  }

  if (entitlementError) {
    throw new Error(
      `RoutePro entitlement lookup failed: ${entitlementError.message}`,
    );
  }

  if (trialError) {
    throw new Error(
      `RoutePro trial lookup failed: ${trialError.message}`,
    );
  }

  const role = String(profile?.role ?? "")
    .trim()
    .toLowerCase();

  const isOwner = role === "owner";

  const provider = String(entitlement?.provider ?? "")
    .trim()
    .toLowerCase();

  const hasActiveEntitlement =
    entitlement?.is_active === true &&
    (provider === "whop" || provider === "manual");

  /*
   * Owner e utenti con entitlement attivo non devono essere bloccati
   * da un eventuale vecchio trial scaduto.
   */
  if (!isOwner && !hasActiveEntitlement) {
    /*
     * Chi ha già avuto un abbonamento a pagamento non può rientrare
     * nel trial dopo la cancellazione.
     */
    if (entitlement?.has_had_paid_access === true) {
      redirect("/app/upgrade?module=routepro");
    }

    /*
     * Controlliamo solamente un trial GIÀ esistente.
     *
     * Se il trial non esiste, lasciamo entrare l'utente:
     * sarà il primo Analyze AI ad avviare realmente i 7 giorni / 5 rotte.
     */
    if (trial) {
      const routesUsed = Number(trial.routes_used ?? 0);
      const routesLimit = Number(trial.routes_limit ?? 5);
      const expiresAt = new Date(trial.expires_at).getTime();

      const trialExpired =
        trial.status === "expired" ||
        (Number.isFinite(expiresAt) && expiresAt <= Date.now());

      const trialExhausted =
        trial.status === "exhausted" ||
        routesUsed >= routesLimit;

      if (trialExpired || trialExhausted) {
        redirect("/app/upgrade?module=routepro");
      }
    }
  }

  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Crea, importa e prepara una nuova rotta" />

      <div
        style={{
          marginTop: 24,
          marginBottom: 22,
        }}
      >
        <p
          style={{
            ...ui.page.eyebrow,
            margin: 0,
            color: "#3b82f6",
          }}
        >
          Nuova rotta
        </p>

        <h1
          style={{
            ...ui.page.title,
            margin: "8px 0 0",
            color: "#ffffff",
          }}
        >
          Prepara il tuo turno
        </h1>

        <p
          style={{
            ...ui.page.subtitle,
            margin: "10px 0 0",
            maxWidth: 820,
            color: "#cbd5e1",
          }}
        >
          Imposta i dati della rotta, carica gli screenshot e lascia che RoutePro
          prepari il workflow operativo.
        </p>
      </div>

      <RouteProNewRouteWorkflowClient />
    </section>
  );
}