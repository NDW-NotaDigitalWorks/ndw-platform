import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { userHasModuleAccess } from "@/modules/core/server/module-entitlements";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

export const metadata: Metadata = {
  title: "RoutePro",
  description:
    "Import your stops. Review your route. Drive smarter.",
  applicationName: "RoutePro",
  manifest: "/brand/routepro/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/brand/routepro/routepro-icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/brand/routepro/routepro-icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/brand/routepro/routepro-icon-192.png",
    apple: [
      {
        url: "/brand/routepro/routepro-apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: "RoutePro",
    statusBarStyle: "black-translucent",
  },
};

function getRemainingDays(expiresAt: string): number {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();

  if (!Number.isFinite(expires)) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
  );
}

export default async function RouteProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAccess = await userHasModuleAccess("routepro");

  if (!hasAccess) {
    redirect("/app/upgrade?module=routepro");
  }

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
      .select("started_at,expires_at,routes_used,routes_limit,status")
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

  const hasActiveEntitlement =
    entitlement?.is_active === true &&
    (entitlement.provider === "whop" ||
      entitlement.provider === "manual");

  const showTrialBanner =
    !isOwner &&
    !hasActiveEntitlement &&
    entitlement?.has_had_paid_access !== true;

  const accent = ndwModuleAccents.routepro;

  const routesUsed = Number(trial?.routes_used ?? 0);
  const routesLimit = Number(trial?.routes_limit ?? 5);

  const remainingRoutes = Math.max(
    0,
    routesLimit - routesUsed,
  );

  const remainingDays = trial?.expires_at
    ? getRemainingDays(trial.expires_at)
    : 7;

  const trialStarted = Boolean(trial);

  return (
    <>
      {showTrialBanner ? (
        <div
          style={{
            maxWidth: ndwTokens.layout.contentMaxWidth,
            margin: "0 auto 18px",
            padding: "14px 16px",
            borderRadius: ndwTokens.radius.xl,
            border: `1px solid ${accent.accentBorder}`,
            background: accent.accentSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: "1 1 280px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <strong
                style={{
                  color: accent.accentText,
                  fontSize: 14,
                  fontWeight: 950,
                }}
              >
                Prova gratuita RoutePro
              </strong>

              <span
                style={{
                  color: ndwTokens.colors.textMuted,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {trialStarted
                  ? `${remainingRoutes} ${
                      remainingRoutes === 1
                        ? "rotta rimasta"
                        : "rotte rimaste"
                    } · ${remainingDays} ${
                      remainingDays === 1
                        ? "giorno rimasto"
                        : "giorni rimasti"
                    }`
                  : "7 giorni o 5 rotte"}
              </span>
            </div>

            <p
              style={{
                margin: "5px 0 0",
                color: ndwTokens.colors.textSecondary,
                fontSize: 12,
                lineHeight: 1.4,
              }}
            >
              Puoi attivare RoutePro in qualsiasi momento
              senza aspettare la fine della prova.
            </p>
          </div>

          <Link
            href="/app/checkout/routepro"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 42,
              padding: "0 17px",
              borderRadius: ndwTokens.radius.md,
              background: accent.accent,
              border: `1px solid ${accent.accent}`,
              color: ndwTokens.colors.textPrimary,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 950,
              whiteSpace: "nowrap",
              boxShadow: "0 10px 24px rgba(255,122,0,0.18)",
            }}
          >
            Attiva RoutePro ora
          </Link>
        </div>
      ) : null}

      {children}
    </>
  );
}