import {
  getAuthCallbackUrl,
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

  const confirmPassword = String(
    formData.get("confirmPassword") ?? "",
  );

  const next = getSafeNextPath(
    String(formData.get("next") ?? ""),
  );

  if (!email || !password || password.length < 8) {
    redirect(
      getLoginUrl(next, {
        signup: true,
        error: "invalid-signup",
      }),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      getLoginUrl(next, {
        signup: true,
        error: "password-mismatch",
      }),
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(
        request.url,
        next,
      ),
    },
  });

  if (error) {
    console.error("Signup error:", error.message);

    redirect(
      getLoginUrl(next, {
        signup: true,
        error: "signup",
      }),
    );
  }

  if (!data.session) {
    redirect(
      getLoginUrl(next, {
        signupEmailSent: true,
      }),
    );
  }

  redirect(next);
}