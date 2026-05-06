import Link from "next/link";

export default function RouteProLandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#f8fafc",
        padding: "64px 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* HERO */}
        <section style={{ textAlign: "center" }}>
          <p style={{ color: "#22c55e", fontWeight: 700 }}>
            RoutePro — Amazon Flex Tool
          </p>

          <h1
            style={{
              fontSize: 48,
              lineHeight: 1.1,
              margin: "16px 0",
              fontWeight: 900,
            }}
          >
            Da screenshot a rotta pronta
            <br />
            in meno di 10 minuti
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#cbd5f5",
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            Carica gli screenshot Amazon Flex.
            RoutePro estrae automaticamente gli stop, li ordina correttamente
            e ti prepara la rotta.
          </p>

          <div style={{ marginTop: 32 }}>
            <a
              href="https://whop.com/ndw-nota-digital-works/routepro-pro/"
              target="_blank"
              style={{
                background: "#22c55e",
                color: "#022c22",
                padding: "16px 28px",
                borderRadius: 12,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Inizia ora
            </a>

            <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
              Usa il codice <strong>early10</strong> per lo sconto lancio
            </p>
          </div>
        </section>

        {/* PROBLEMA */}
        <section style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>
            Ti riconosci in questo?
          </h2>

          <ul style={{ marginTop: 16, lineHeight: 1.8 }}>
            <li>❌ Fai decine di screenshot ogni giorno</li>
            <li>❌ Perdi tempo a copiare indirizzi</li>
            <li>❌ Gli stop sono disordinati</li>
            <li>❌ Parti in ritardo perché devi sistemare tutto</li>
          </ul>
        </section>

        {/* SOLUZIONE */}
        <section style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>
            RoutePro risolve tutto questo
          </h2>

          <ul style={{ marginTop: 16, lineHeight: 1.8 }}>
            <li>✔ Carichi gli screenshot</li>
            <li>✔ Gli stop vengono estratti automaticamente</li>
            <li>✔ L’ordine originale Amazon viene mantenuto</li>
            <li>✔ Hai la rotta pronta in pochi minuti</li>
          </ul>
        </section>

        {/* FLOW */}
        <section style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>
            Come funziona
          </h2>

          <div style={{ marginTop: 16, lineHeight: 1.8 }}>
            <p>1. Carica gli screenshot</p>
            <p>2. Controlla il preview automatico</p>
            <p>3. Geocodifica e ottimizza</p>
            <p>4. Parti subito con la rotta</p>
          </div>
        </section>

        {/* VALUE */}
        <section style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>
            Perché funziona davvero
          </h2>

          <ul style={{ marginTop: 16, lineHeight: 1.8 }}>
            <li>✔ OCR ottimizzato per Amazon Flex</li>
            <li>✔ Multi screenshot (anche 40+ immagini)</li>
            <li>✔ Numerazione originale mantenuta</li>
            <li>✔ Pensato per driver reali, non per teoria</li>
          </ul>
        </section>

        {/* CTA FINALE */}
        <section style={{ marginTop: 80, textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900 }}>
            Smetti di perdere tempo prima di partire
          </h2>

          <p style={{ marginTop: 12, fontSize: 16, color: "#cbd5f5" }}>
            Trasforma i tuoi screenshot in una rotta pronta in pochi minuti.
          </p>

          <div style={{ marginTop: 28 }}>
            <a
              href="https://whop.com/ndw-nota-digital-works/routepro-pro-ad"
              target="_blank"
              style={{
                background: "#22c55e",
                color: "#022c22",
                padding: "16px 28px",
                borderRadius: 12,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Attiva RoutePro
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}