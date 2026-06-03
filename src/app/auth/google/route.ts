import { getAuthCallbackUrl } from "@/lib/auth/auth-url";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(request.url, "/app"),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    console.error("Google login error:", error?.message);

    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }

  return NextResponse.redirect(data.url);
}