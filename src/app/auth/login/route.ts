import { getAuthCallbackUrl } from "@/lib/auth/auth-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/login?error=missing-email");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthCallbackUrl(request.url, "/app"),
    },
  });

  if (error) {
    console.error("Login error:", error.message);
    redirect("/login?error=1");
  }

  redirect("/login?check-email=1");
}