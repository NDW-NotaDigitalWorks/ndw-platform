import { getBaseUrl } from "@/lib/auth/auth-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/login?error=missing-email");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl(request.url)}/reset-password`,
  });

  if (error) {
    console.error("Forgot password error:", error.message);
    redirect("/login?error=reset-request");
  }

  redirect("/login?reset-email=1");
}