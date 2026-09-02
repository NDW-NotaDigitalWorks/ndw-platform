import { getAuthCallbackUrl } from "@/lib/auth/auth-url";
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

  if (!email || !password || password.length < 8) {
    redirect("/login?mode=signup&error=invalid-signup");
  }

  if (password !== confirmPassword) {
    redirect("/login?mode=signup&error=password-mismatch");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(
        request.url,
        "/app",
      ),
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    redirect("/login?mode=signup&error=signup");
  }

  /*
   * Se Supabase richiede la conferma email, signUp crea l'utente
   * ma non restituisce una sessione utilizzabile.
   *
   * In questo caso mandiamo il cliente alla schermata di login
   * con un messaggio esplicito di verifica email.
   */
  if (!data.session) {
    redirect("/login?signup-email-sent=1");
  }

  /*
   * Questo ramo mantiene compatibilità nel caso in cui la
   * conferma email venga disattivata nel progetto Supabase.
   */
  redirect("/app");
}