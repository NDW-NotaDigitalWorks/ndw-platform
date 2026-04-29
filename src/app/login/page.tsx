import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ padding: 24 }}>
      <h1>Login NDW Core</h1>

      {user ? (
        <p>Sei già loggato come: {user.email}</p>
      ) : (
        <form action="/auth/login" method="post">
          <label>
            Email
            <br />
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              style={{ padding: 8, marginTop: 8 }}
            />
          </label>

          <br />
          <br />

          <button type="submit" style={{ padding: 8 }}>
            Invia magic link
          </button>
        </form>
      )}
    </main>
  );
}