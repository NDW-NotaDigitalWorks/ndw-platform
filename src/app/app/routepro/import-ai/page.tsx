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

        <h1 style={routeProUi.heroTitle}>AI Screenshot Import</h1>

        <p style={routeProUi.heroSubtitle}>
          Carica gli screenshot Amazon Flex. RoutePro li analizzerà in batch,
          manterrà il numero stop originale e proteggerà la rotta da stop
          mancanti.
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <AiScreenshotImportClient />
      </div>
    </section>
  );
}