import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getWhopClient,
  getWhopEnvironment,
} from "@/lib/whop/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "authentication-required" },
        { status: 401 },
      );
    }

    if (!user.email || !user.email_confirmed_at) {
      return NextResponse.json(
        { ok: false, error: "verified-email-required" },
        { status: 403 },
      );
    }

    const planId = process.env.WHOP_ROUTEPRO_PLAN_ID;
    const productId = process.env.WHOP_ROUTEPRO_PRODUCT_ID;

    if (!planId || !productId) {
      console.error("Missing RoutePro Whop configuration");

      return NextResponse.json(
        { ok: false, error: "checkout-configuration-missing" },
        { status: 500 },
      );
    }

    const origin = new URL(request.url).origin;
    const isHttps = origin.startsWith("https://");

    const returnUrl = isHttps
      ? `${origin}/app/checkout/routepro?payment=complete`
      : null;

    const whop = getWhopClient();
    const environment = getWhopEnvironment();

    const checkout = await whop.checkoutConfigurations.create({
      plan_id: planId,
      mode: "payment",
      ...(returnUrl ? { redirect_url: returnUrl } : {}),
      metadata: {
        ndw_user_id: user.id,
        ndw_email: user.email,
        ndw_module_key: "routepro",
        ndw_plan_code: "pro",
        whop_product_id: productId,
        whop_plan_id: planId,
      },
    });

    return NextResponse.json({
      ok: true,
      sessionId: checkout.id,
      returnUrl,
      environment,
    });
  } catch (error) {
    console.error("RoutePro Whop checkout error", error);

    return NextResponse.json(
      { ok: false, error: "checkout-unavailable" },
      { status: 500 },
    );
  }
}