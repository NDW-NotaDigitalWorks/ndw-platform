import { RouteProHeader } from "@/modules/routepro/ui/RouteProHeader";
import { RouteProNewRouteWorkflowClient } from "@/modules/routepro/ui/RouteProNewRouteWorkflowClient";
import { ui } from "@/styles/ui";

export default function RouteProNewRoutePage() {
  return (
    <section style={ui.page.section}>
      <RouteProHeader subtitle="Crea, importa e prepara una nuova rotta" />

      <p style={ui.page.eyebrow}>Nuova rotta</p>
      <h1 style={ui.page.title}>Prepara il tuo turno</h1>
      <p style={ui.page.subtitle}>
        Imposta i dati della rotta, carica gli screenshot e lascia che RoutePro
        prepari il workflow operativo.
      </p>

      <RouteProNewRouteWorkflowClient />
    </section>
  );
}