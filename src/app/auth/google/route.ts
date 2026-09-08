import {
  getAuthCallbackUrl,
  getLoginUrl,
  getSafeNextPath,
} from "@/lib/auth/auth-url";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const next = getSafeNextPath(
    requestUrl.searchParams.get("next"),
  );

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(
        request.url,
        next,
      ),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    console.error("Google login error:", error?.message);

    return NextResponse.redirect(
      new URL(
        getLoginUrl(next, {
          error: "google",
        }),
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(data.url);
}