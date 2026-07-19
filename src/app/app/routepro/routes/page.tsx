import Link from "next/link";
import { getMyRouteProRoutes } from "@/modules/routepro/server/routepro.routes";
import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { RouteProRoutesArchiveClient } from "@/modules/routepro/ui/RouteProRoutesArchiveClient";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";
import { ui } from "@/styles/ui";

export default async function RouteProRoutesPage() {
  const routes = await getMyRouteProRoutes();

  return (
    <section style={routeProUi.shell}>
      <RouteProHeader subtitle="Consulta, cerca e riapri tutte le tue rotte" />

      <div style={ui.card.base}>
        <p style={ui.page.eyebrow}>Route History</p>

        <h1 style={ui.page.title}>Tutte le rotte</h1>

        <p style={ui.page.subtitle}>
          Cerca una rotta, filtra per stato e riprendi il workflow corretto.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Link
            href="/app/routepro"
            style={routeProUi.secondaryButton}
          >
            Torna alla Dashboard
          </Link>

          <Link
            href="/app/routepro/new"
            style={routeProUi.primaryButton}
          >
            Nuova rotta
          </Link>
        </div>
      </div>

      <RouteProRoutesArchiveClient routes={routes} />
    </section>
  );
}