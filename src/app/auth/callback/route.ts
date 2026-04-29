import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getSafeNextPath(value: string | null): string {
  if (!value) {
    return "/app";
  }

  if (!value.startsWith("/")) {
    return "/app";
  }

  if (value.startsWith("//")) {
    return "/app";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing-code", requestUrl.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}