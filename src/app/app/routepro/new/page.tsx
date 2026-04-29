import Link from "next/link";
import { createRouteProRoute } from "@/modules/routepro/server/routepro.actions";
import { ui } from "@/styles/ui";

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 20,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 8,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  fontWeight: 600,
};

function getErrorMessage(error?: string): string | null {
  if (error === "missing-date") {
    return "Inserisci la data della rotta.";
  }

  if (error === "create-failed") {
    return "Non siamo riusciti a creare la rotta. Riprova.";
  }

  return null;
}

export default async function RouteProNewRoutePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>RoutePro</p>
      <h1 style={ui.page.title}>Nuova rotta</h1>
      <p style={ui.page.subtitle}>
        Crea una nuova rotta per iniziare a importare gli stop.
      </p>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <form action={createRouteProRoute} style={{ ...ui.card.base, ...formStyle }}>
        <label style={ui.form.label}>
          Nome rotta
          <input
            name="name"
            type="text"
            placeholder="Esempio: Milano mattina"
            style={ui.form.input}
          />
        </label>

        <label style={ui.form.label}>
          Data rotta
          <input name="route_date" type="date" required style={ui.form.input} />
        </label>

        <label style={ui.form.label}>
          Punto di partenza opzionale
          <input
            name="start_address"
            type="text"
            placeholder="Esempio: Deposito, casa, magazzino..."
            style={ui.form.input}
          />
        </label>

        <div style={actionsStyle}>
          <button type="submit" style={ui.button.primary}>
            Crea rotta
          </button>

          <Link href="/app/routepro" style={ui.button.secondary}>
            Annulla
          </Link>
        </div>
      </form>
    </section>
  );
}