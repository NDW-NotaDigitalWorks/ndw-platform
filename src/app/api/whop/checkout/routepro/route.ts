import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getWhopClient,
  getWhopEnvironment,
} from "@/lib/whop/server";
import { hasRouteProFounderAvailability } from "@/modules/routepro/server/routepro-founder";

const ROUTEPRO_MODULE_KEY = "routepro";

type RouteProOffer =
  | "founding_driver"
  | "standard";

function isOwnerRole(
  role: string | null | undefined,
): boolean {
  return role?.trim().toLowerCase() === "owner";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "authentication-required",
        },
        { status: 401 },
      );
    }

    if (!user.email || !user.email_confirmed_at) {
      return NextResponse.json(
        {
          ok: false,
          error: "verified-email-required",
        },
        { status: 403 },
      );
    }

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
      return NextResponse.json(
        {
          ok: false,
          error: "account-inactive",
        },
        { status: 403 },
      );
    }

    if (isOwnerRole(profile.role)) {
      return NextResponse.json(
        {
          ok: false,
          error: "routepro-already-active",
          reason: "owner",
        },
        { status: 409 },
      );
    }

    const {
      data: entitlement,
      error: entitlementError,
    } = await supabase
      .from("module_entitlements")
      .select(
        "provider,is_active,has_had_paid_access",
      )
      .eq("user_id", user.id)
      .eq("module_key", ROUTEPRO_MODULE_KEY)
      .maybeSingle();

    if (entitlementError) {
      throw new Error(
        `RoutePro checkout entitlement lookup failed: ${entitlementError.message}`,
      );
    }

    if (entitlement?.is_active === true) {
      return NextResponse.json(
        {
          ok: false,
          error: "routepro-already-active",
          reason:
            entitlement.provider === "manual"
              ? "manual"
              : entitlement.provider === "whop"
                ? "whop"
                : "active-entitlement",
        },
        { status: 409 },
      );
    }

    let offer: RouteProOffer = "standard";

    if (!entitlement?.has_had_paid_access) {
      const founderAvailable =
        await hasRouteProFounderAvailability();

      if (founderAvailable) {
        offer = "founding_driver";
      }
    }

    const founderPlanId =
      process.env.WHOP_ROUTEPRO_PLAN_ID;

    const standardPlanId =
      process.env.WHOP_ROUTEPRO_STANDARD_PLAN_ID;

    const productId =
      process.env.WHOP_ROUTEPRO_PRODUCT_ID;

    if (
      !founderPlanId ||
      !standardPlanId ||
      !productId
    ) {
      console.error(
        "Missing RoutePro Whop configuration",
      );

      return NextResponse.json(
        {
          ok: false,
          error: "checkout-configuration-missing",
        },
        { status: 500 },
      );
    }

    const selectedPlanId =
      offer === "founding_driver"
        ? founderPlanId
        : standardPlanId;

    const origin = new URL(request.url).origin;
    const isHttps = origin.startsWith("https://");

    const returnUrl = isHttps
      ? `${origin}/app/checkout/routepro?payment=complete`
      : null;

    const whop = getWhopClient();
    const environment = getWhopEnvironment();

    console.log(
      "ROUTEPRO CHECKOUT BEFORE CREATE",
      JSON.stringify(
        {
          environment,
          offer,
          founderPlanId,
          standardPlanId,
          selectedPlanId,
          productId,
        },
        null,
        2,
      ),
    );

    const checkout =
      await whop.checkoutConfigurations.create({
        plan_id: selectedPlanId,
        mode: "payment",
        ...(returnUrl
          ? { redirect_url: returnUrl }
          : {}),
        metadata: {
          ndw_user_id: user.id,
          ndw_email: user.email,
          ndw_module_key: ROUTEPRO_MODULE_KEY,
          ndw_plan_code: "pro",
          ndw_offer: offer,
          whop_product_id: productId,
          whop_plan_id: selectedPlanId,
        },
      });

    console.log(
      "ROUTEPRO CHECKOUT AFTER CREATE",
      JSON.stringify(
        {
          environment,
          offer,
          selectedPlanId,
          checkoutId: checkout.id,
          checkout,
        },
        null,
        2,
      ),
    );

    return NextResponse.json({
      ok: true,
      sessionId: checkout.id,
      returnUrl,
      environment,
      offer,
      diagnostic: {
        founderPlanId,
        standardPlanId,
        selectedPlanId,
      },
    });
  } catch (error) {
    console.error(
      "RoutePro Whop checkout error",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "checkout-unavailable",
      },
      { status: 500 },
    );
  }
}
