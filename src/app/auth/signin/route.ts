import {
  getLoginUrl,
  getSafeNextPath,
} from "@/lib/auth/auth-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");
  const next = getSafeNextPath(
    String(formData.get("next") ?? ""),
  );

  if (!email || !password) {
    redirect(
      getLoginUrl(next, {
        error: "invalid-login",
      }),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Signin error:", error.message);

    redirect(
      getLoginUrl(next, {
        error: "signin",
      }),
    );
  }

  redirect(next);
}