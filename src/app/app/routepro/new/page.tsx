import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { RouteProNewRouteWorkflowClient } from "@/modules/routepro/ui/RouteProNewRouteWorkflowClient";
import { ui } from "@/styles/ui";

export default function RouteProNewRoutePage() {
  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Crea, importa e prepara una nuova rotta" />

      <div
        style={{
          marginTop: 24,
          marginBottom: 22,
        }}
      >
        <p
          style={{
            ...ui.page.eyebrow,
            margin: 0,
            color: "#3b82f6",
          }}
        >
          Nuova rotta
        </p>

        <h1
          style={{
            ...ui.page.title,
            margin: "8px 0 0",
            color: "#ffffff",
          }}
        >
          Prepara il tuo turno
        </h1>

        <p
          style={{
            ...ui.page.subtitle,
            margin: "10px 0 0",
            maxWidth: 820,
            color: "#cbd5e1",
          }}
        >
          Imposta i dati della rotta, carica gli screenshot e lascia che RoutePro
          prepari il workflow operativo.
        </p>
      </div>

      <RouteProNewRouteWorkflowClient />
    </section>
  );
}