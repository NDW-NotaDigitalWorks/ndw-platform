import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!password || password.length < 8) {
    redirect("/reset-password?error=invalid-password");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Update password error:", error.message);
    redirect("/reset-password?error=update");
  }

  redirect("/login?password-updated=1");
}