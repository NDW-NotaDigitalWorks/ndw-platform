import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password || password.length < 8) {
    redirect("/login?mode=signup&error=invalid-signup");
  }

  if (password !== confirmPassword) {
    redirect("/login?mode=signup&error=password-mismatch");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    redirect("/login?mode=signup&error=signup");
  }

  redirect("/app");
}