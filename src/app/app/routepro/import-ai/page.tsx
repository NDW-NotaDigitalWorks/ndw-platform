import { AiScreenshotImportClient } from "@/modules/routepro/ui/AiScreenshotImportClient";
import { routeProUi } from "@/modules/routepro/ui/routepro.ui";

export default function RouteProAiImportPage() {
  return (
    <section style={routeProUi.shell}>
      <div style={routeProUi.hero}>
        <p
          style={{
            margin: 0,
            color: "#ff8a00",
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          RoutePro AI Import
        </p>

        <h1 style={routeProUi.heroTitle}>Importa la tua rotta</h1>

        <p style={routeProUi.heroSubtitle}>
          Carica gli screenshot della tua app di consegna. RoutePro individua
          gli stop, mantiene la numerazione originale e prepara il percorso per
          il workflow RoutePro.
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <AiScreenshotImportClient />
      </div>
    </section>
  );
}
