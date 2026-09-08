import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModuleEntitlement } from "@/modules/billing/server/billing-access";

export async function GET() {
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
        {
          status: 401,
        },
      );
    }

    const entitlement = await getModuleEntitlement({
      userId: user.id,
      moduleKey: "routepro",
    });

    return NextResponse.json({
      ok: true,
      active: entitlement?.is_active === true,
      provider: entitlement?.provider ?? null,
      planCode: entitlement?.plan_code ?? null,
    });
  } catch (error) {
    console.error("RoutePro entitlement status error", error);

    return NextResponse.json(
      {
        ok: false,
        error: "status-unavailable",
      },
      {
        status: 500,
      },
    );
  }
}