import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

const routePro = ndwModuleAccents.routepro;
const ndw = ndwModuleAccents.core;

const cardStyle = {
  borderRadius: 20,
  background: "rgba(255,255,255,0.035)",
  border: `1px solid ${ndwTokens.colors.border}`,
} as const;

const sectionLabelStyle = {
  margin: 0,
  color: routePro.accentText,
  fontWeight: 800,
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
} as const;

const primaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 28px",
  borderRadius: 14,
  border: `1px solid ${routePro.accent}`,
  background: `linear-gradient(135deg, ${routePro.accent} 0%, ${routePro.accentHighlight} 100%)`,
  color: "#FFFFFF",
  fontWeight: 900,
  textDecoration: "none",
  fontSize: 16,
  boxShadow: "0 14px 34px rgba(255,122,0,0.22)",
} as const;

export default function RouteProLandingPage() {
  const features = [
    {
      title: "Import intelligente",
      text: "Carica gli screenshot della tua lista di consegne. RoutePro estrae gli stop e li prepara per il controllo.",
    },
    {
      title: "Controllo prima di partire",
      text: "Rivedi indirizzi e stop prima della preparazione della rotta, mantenendo sempre il controllo.",
    },
    {
      title: "Ottimizzazione della rotta",
      text: "RoutePro analizza gli stop e costruisce una sequenza pensata per ridurre spostamenti inutili e continui avanti e indietro.",
    },
    {
      title: "Modalità Drive",
      text: "Segui la rotta durante il turno, completa o salta gli stop e apri rapidamente la navigazione quando serve.",
    },
  ];

  const flow = [
    "Carica gli screenshot della rotta",
    "Controlla gli stop estratti",
    "Prepara e ottimizza la sequenza",
    "Parti e gestisci il giro da RoutePro",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 50% -10%, ${routePro.accentSoft} 0%, transparent 30%),
          linear-gradient(180deg, ${ndwTokens.colors.backgroundSoft} 0%, ${ndwTokens.colors.background} 100%)
        `,
        color: ndwTokens.colors.textPrimary,
        fontFamily: ndwTokens.typography.fontFamily,
      }}
    >
      {/* HERO */}
      <section
        style={{
          padding: "72px 20px 58px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${routePro.accentBorder}`,
              background: routePro.accentSoft,
              color: routePro.accentText,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: routePro.accent,
                boxShadow: `0 0 16px ${routePro.accent}`,
              }}
            />
            NDW RoutePro
          </div>

          <h1
            style={{
              maxWidth: 900,
              margin: "22px auto 0",
              fontSize: "clamp(42px, 7vw, 72px)",
              lineHeight: 1.03,
              letterSpacing: "-0.04em",
              fontWeight: 900,
            }}
          >
            La tua rotta.
            <br />
            Più semplice da preparare.
            <br />
            <span style={{ color: routePro.accentText }}>
              Più semplice da guidare.
            </span>
          </h1>

          <p
            style={{
              maxWidth: 720,
              margin: "24px auto 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: "clamp(17px, 2vw, 20px)",
              lineHeight: 1.65,
            }}
          >
            RoutePro trasforma screenshot e liste di consegna in una rotta
            controllata e ottimizzata, accompagnandoti dalla preparazione fino
            all&apos;ultimo stop.
          </p>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <a href="/app/routepro" style={primaryCtaStyle}>
              Prova RoutePro gratis
            </a>

            <a
              href="#come-funziona"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
                padding: "0 28px",
                borderRadius: 14,
                background: ndwTokens.colors.surfaceRaised,
                color: ndwTokens.colors.textPrimary,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Scopri come funziona
            </a>
          </div>

          <p
            style={{
              marginTop: 14,
              color: ndwTokens.colors.textMuted,
              fontSize: 14,
            }}
          >
            7 giorni o 5 rotte AI di prova, ciò che arriva prima. Nessuna carta
            richiesta.
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ padding: "18px 20px 58px" }}>
        <div
          style={{
            ...cardStyle,
            maxWidth: 1040,
            margin: "0 auto",
            padding: "32px",
          }}
        >
          <p style={sectionLabelStyle}>Prima della partenza</p>

          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "clamp(30px, 4vw, 44px)",
              lineHeight: 1.12,
              fontWeight: 900,
            }}
          >
            Una rotta disordinata ti fa perdere tempo ancora prima di iniziare.
          </h2>

          <p
            style={{
              margin: "18px 0 0",
              maxWidth: 780,
              color: ndwTokens.colors.textSecondary,
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            Screenshot, indirizzi da controllare, stop lontani tra loro e
            sequenze che ti fanno tornare più volte nella stessa zona. RoutePro
            raccoglie queste operazioni in un unico flusso pensato per chi
            lavora davvero su strada.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "28px 20px 64px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={sectionLabelStyle}>Un unico workflow</p>

          <h2
            style={{
              margin: "12px 0 28px",
              fontSize: "clamp(32px, 4vw, 46px)",
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            Dalla lista delle consegne alla strada.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 18,
            }}
          >
            {features.map((feature, index) => (
              <article
                key={feature.title}
                style={{
                  ...cardStyle,
                  padding: 26,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: routePro.accentSoft,
                    color: routePro.accentText,
                    border: `1px solid ${routePro.accentBorder}`,
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </div>

                <h3
                  style={{
                    margin: "18px 0 10px",
                    fontSize: 20,
                    fontWeight: 850,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: ndwTokens.colors.textSecondary,
                    lineHeight: 1.65,
                    fontSize: 15,
                  }}
                >
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section
        id="come-funziona"
        style={{ padding: "30px 20px 70px" }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ maxWidth: 720 }}>
            <p style={sectionLabelStyle}>Come funziona</p>

            <h2
              style={{
                margin: "12px 0 28px",
                fontSize: "clamp(32px, 4vw, 46px)",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Quattro passaggi. Una sola rotta.
            </h2>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {flow.map((step, index) => (
              <div
                key={step}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "18px 22px",
                  borderRadius: 18,
                }}
              >
                <div
                  style={{
                    flex: "0 0 auto",
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: routePro.accent,
                    color: "#FFFFFF",
                    fontWeight: 900,
                    boxShadow: "0 8px 20px rgba(255,122,0,0.18)",
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ fontSize: 17, fontWeight: 750 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "28px 20px 72px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 32px",
            }}
          >
            <p style={sectionLabelStyle}>Lancio RoutePro</p>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: "clamp(32px, 4vw, 46px)",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Parti gratis. Decidi dopo.
            </h2>

            <p
              style={{
                margin: "14px auto 0",
                color: ndwTokens.colors.textMuted,
                lineHeight: 1.6,
              }}
            >
              Se rientri tra i primi 100 clienti, RoutePro ti assegna
              automaticamente il prezzo Founding Driver.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            {/* FOUNDER */}
            <article
              style={{
                position: "relative",
                padding: 30,
                borderRadius: 22,
                background: `
                  radial-gradient(circle at top right, ${routePro.accentSoft}, transparent 42%),
                  ${ndwTokens.colors.surfaceSoft}
                `,
                border: `1px solid ${routePro.accentBorder}`,
                boxShadow: "0 18px 50px rgba(255,122,0,0.10)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 10px",
                  marginBottom: 16,
                  borderRadius: 999,
                  background: ndwTokens.colors.successSoft,
                  color: "#86EFAC",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: ndwTokens.colors.success,
                  }}
                />
                PRIMI 100 CLIENTI
              </div>

              <p
                style={{
                  margin: 0,
                  color: routePro.accentText,
                  fontWeight: 900,
                }}
              >
                Founding Driver
              </p>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 42,
                  fontWeight: 900,
                }}
              >
                €19,99
                <span
                  style={{
                    fontSize: 15,
                    color: ndwTokens.colors.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  / mese + IVA
                </span>
              </div>

              <p
                style={{
                  color: ndwTokens.colors.textSecondary,
                  lineHeight: 1.65,
                }}
              >
                Prezzo di lancio riservato ai primi 100 clienti. Rimane €19,99
                al mese finché l&apos;abbonamento resta attivo senza
                interruzioni.
              </p>
            </article>

            {/* STANDARD */}
            <article
              style={{
                ...cardStyle,
                padding: 30,
                opacity: 0.82,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: ndwTokens.colors.textSecondary,
                  fontWeight: 900,
                }}
              >
                RoutePro Standard
              </p>

              <div
                style={{
                  marginTop: 38,
                  fontSize: 40,
                  fontWeight: 900,
                }}
              >
                €29,99
                <span
                  style={{
                    fontSize: 15,
                    color: ndwTokens.colors.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  / mese + IVA
                </span>
              </div>

              <p
                style={{
                  color: ndwTokens.colors.textSecondary,
                  lineHeight: 1.65,
                }}
              >
                Prezzo standard RoutePro applicato dopo l&apos;assegnazione dei
                primi 100 posti Founding Driver.
              </p>
            </article>
          </div>

          <div style={{ marginTop: 30, textAlign: "center" }}>
            <a href="/app/routepro" style={primaryCtaStyle}>
              Inizia la prova gratuita
            </a>

            <p
              style={{
                maxWidth: 620,
                margin: "13px auto 0",
                color: ndwTokens.colors.textMuted,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              La prova termina dopo 7 giorni o 5 rotte AI, a seconda di quale
              limite viene raggiunto per primo. Non è richiesta una carta di
              pagamento.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "32px 20px 80px" }}>
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "48px 28px",
            textAlign: "center",
            borderRadius: 28,
            background: `
              radial-gradient(circle at top, ${routePro.accentSoft} 0%, transparent 55%),
              linear-gradient(135deg, ${ndwTokens.colors.surfaceRaised}, ${ndwTokens.colors.surface})
            `,
            border: `1px solid ${routePro.accentBorder}`,
            boxShadow: ndwTokens.shadows.md,
          }}
        >
          <div
            style={{
              margin: "0 auto 18px",
              width: 46,
              height: 46,
              borderRadius: 15,
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${routePro.accent}, ${routePro.accentHighlight})`,
              color: "#FFFFFF",
              fontWeight: 950,
              boxShadow: "0 12px 28px rgba(255,122,0,0.22)",
            }}
          >
            RP
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "clamp(32px, 5vw, 50px)",
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Meno tempo a sistemare la rotta.
            <br />
            <span style={{ color: routePro.accentText }}>
              Più tempo per consegnare.
            </span>
          </h2>

          <p
            style={{
              maxWidth: 650,
              margin: "18px auto 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: 17,
              lineHeight: 1.65,
            }}
          >
            Prova il workflow completo di RoutePro e valuta direttamente sul
            campo se migliora il tuo modo di lavorare.
          </p>

          <div style={{ marginTop: 28 }}>
            <a href="/app/routepro" style={primaryCtaStyle}>
              Prova RoutePro gratis
            </a>
          </div>

          <p
            style={{
              margin: "14px 0 0",
              color: ndw.accentText,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Un prodotto NDW · Nota Digital Works
          </p>
        </div>
      </section>
    </main>
  );
}