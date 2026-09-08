import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  /*
   * Informazioni interne usate dalle Server Components NDW.
   *
   * x-current-path:
   *   pathname puro, utile alla navigazione del workspace.
   *
   * x-auth-next:
   *   pathname + query string, utile per riportare l'utente
   *   esattamente alla pagina richiesta dopo l'autenticazione.
   *
   * Il proxy sovrascrive sempre questi valori, quindi non ci
   * affidiamo a eventuali header omonimi inviati dal browser.
   */
  requestHeaders.set("x-current-path", request.nextUrl.pathname);
  requestHeaders.set(
    "x-auth-next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  function createSupabaseResponse() {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let supabaseResponse = createSupabaseResponse();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase proxy environment variables.");
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          /*
           * Se Supabase aggiorna i cookie della sessione,
           * riallineiamo anche l'header Cookie inoltrato
           * alla richiesta corrente.
           */
          const cookieHeader = request.headers.get("cookie");

          if (cookieHeader) {
            requestHeaders.set("cookie", cookieHeader);
          } else {
            requestHeaders.delete("cookie");
          }

          supabaseResponse = createSupabaseResponse();

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}