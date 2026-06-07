import Link from "next/link";
import { createRouteProRoute } from "@/modules/routepro/server/routepro.actions";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
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
  marginTop: 12,
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
      <RouteProHeader subtitle="Crea e prepara una nuova rotta" />

      <p style={ui.page.eyebrow}>Nuova rotta</p>
      <h1 style={ui.page.title}>Crea percorso</h1>
      <p style={ui.page.subtitle}>
        Dai un nome alla rotta, imposta la data e inizia a importare gli stop.
      </p>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <form action={createRouteProRoute} style={{ ...ui.card.base, ...formStyle }}>
  <label style={ui.form.label}>
    Nome percorso
    <input
      name="name"
      type="text"
      placeholder="Esempio: Milano mattina"
      style={ui.form.input}
    />
  </label>

  <label style={ui.form.label}>
    Data percorso
    <input name="route_date" type="date" required style={ui.form.input} />
  </label>

  <label style={ui.form.label}>
    Profilo rotta
    <select name="route_profile" defaultValue="generic" style={ui.form.input}>
      <option value="generic">Generico</option>
      <option value="amazon_flex">Amazon Flex</option>
      <option value="courier">Corriere / multi-drop</option>
      <option value="technician">Tecnico / appuntamenti</option>
      <option value="sales">Commerciale / visite clienti</option>
    </select>
  </label>

  <label style={ui.form.label}>
    Punto di partenza
    <input
      name="start_address"
      type="text"
      placeholder="Deposito, casa, magazzino..."
      style={ui.form.input}
    />
  </label>

  <label style={ui.form.label}>
    Punto di rientro
    <input
      name="return_address"
      type="text"
      placeholder="Stesso deposito, casa, magazzino..."
      style={ui.form.input}
    />
  </label>

  <label style={ui.form.label}>
    Ora inizio turno
    <input name="shift_start_time" type="time" style={ui.form.input} />
  </label>

  <label style={ui.form.label}>
    Ora fine turno
    <input name="shift_end_time" type="time" style={ui.form.input} />
  </label>

  <label style={ui.form.label}>
    Pausa prevista minuti
    <input
      name="break_minutes"
      type="number"
      min="0"
      step="5"
      defaultValue="30"
      style={ui.form.input}
    />
  </label>

  <div style={actionsStyle}>
    <button type="submit" style={routeProUi.primaryButton}>
      Crea percorso
    </button>

    <Link href="/app/routepro" style={routeProUi.secondaryButton}>
      Annulla
    </Link>
  </div>
</form>
    </section>
  );
}