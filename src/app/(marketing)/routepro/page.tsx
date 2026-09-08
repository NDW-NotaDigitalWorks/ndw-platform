import Image from "next/image";
import { ndwModuleAccents } from "@/styles/ndw/ndw-module-accents";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

const routePro = ndwModuleAccents.routepro;
const ndw = ndwModuleAccents.core;

const cardStyle = {
  borderRadius: 22,
  background: "rgba(255,255,255,0.035)",
  border: `1px solid ${ndwTokens.colors.border}`,
} as const;

const sectionLabelStyle = {
  margin: 0,
  color: routePro.accentText,
  fontWeight: 900,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
} as const;

const primaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 54,
  padding: "0 28px",
  borderRadius: 15,
  border: `1px solid ${routePro.accent}`,
  background: `linear-gradient(135deg, ${routePro.accent} 0%, ${routePro.accentHighlight} 100%)`,
  color: "#FFFFFF",
  fontWeight: 950,
  textDecoration: "none",
  fontSize: 16,
  boxShadow: "0 14px 34px rgba(255,122,0,0.22)",
} as const;

const secondaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 54,
  padding: "0 28px",
  borderRadius: 15,
  background: ndwTokens.colors.surfaceRaised,
  color: ndwTokens.colors.textPrimary,
  border: `1px solid ${ndwTokens.colors.borderStrong}`,
  fontWeight: 850,
  textDecoration: "none",
  fontSize: 16,
} as const;

export default function RouteProLandingPage() {
  const features = [
    {
      title: "Import AI",
      text: "Carica gli screenshot della tua lista di consegne. RoutePro estrae gli stop e prepara tutto per la verifica.",
    },
    {
      title: "Review e verifica",
      text: "Controlla indirizzi e stop prima di partire. Sei sempre tu a decidere cosa confermare o correggere.",
    },
    {
      title: "Ottimizzazione",
      text: "RoutePro analizza la sequenza e prova a ridurre spostamenti inutili, rientri e continui avanti e indietro.",
    },
    {
      title: "Modalità Drive",
      text: "Segui il giro durante il turno, completa o salta gli stop e apri rapidamente la navigazione quando serve.",
    },
  ];

  const workflow = [
    "Import",
    "Review",
    "Verify",
    "Optimize",
    "Drive",
    "Summary",
  ];

  const benefits = [
    "Workflow completo RoutePro",
    "Import AI da screenshot",
    "Review e verifica degli stop",
    "Ottimizzazione della rotta",
    "Modalità Drive",
    "Fino a 50 rotte AI al mese",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: `
          radial-gradient(circle at 50% -8%, ${routePro.accentSoft} 0%, transparent 28%),
          linear-gradient(
            180deg,
            ${ndwTokens.colors.backgroundSoft} 0%,
            ${ndwTokens.colors.background} 100%
          )
        `,
        color: ndwTokens.colors.textPrimary,
        fontFamily: ndwTokens.typography.fontFamily,
      }}
    >
      {/* HERO */}
      <section
        style={{
          padding: "clamp(42px, 8vw, 82px) 20px clamp(48px, 8vw, 72px)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <Image
            src="/brand/routepro/routepro-logo-horizontal.png"
            alt="RoutePro"
            width={420}
            height={130}
            priority
            style={{
              width: "min(320px, 78vw)",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              marginTop: 24,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${routePro.accentBorder}`,
              background: routePro.accentSoft,
              color: routePro.accentText,
              fontSize: 13,
              fontWeight: 900,
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
            Delivery workflow per driver
          </div>

          <h1
            style={{
              maxWidth: 920,
              margin: "24px auto 0",
              fontSize: "clamp(38px, 8vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              fontWeight: 950,
            }}
          >
            La rotta non dovrebbe
            <br />
            farti perdere tempo.
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: "24px auto 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: "clamp(17px, 2.5vw, 21px)",
              lineHeight: 1.65,
            }}
          >
            Importa gli stop. Controllali. Ottimizza il giro. Parti.
            RoutePro trasforma screenshot e liste di consegna in un workflow
            completo, dalla preparazione fino all&apos;ultimo stop.
          </p>

          <div
            style={{
              marginTop: 34,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <a href="/app/routepro" style={primaryCtaStyle}>
              Prova RoutePro gratis
            </a>

            <a href="#come-funziona" style={secondaryCtaStyle}>
              Scopri come funziona
            </a>
          </div>

          <div
            style={{
              margin: "18px auto 0",
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "6px 10px",
              padding: "10px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${ndwTokens.colors.border}`,
              color: ndwTokens.colors.textSecondary,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            <span>7 giorni o 5 rotte AI</span>
            <span style={{ color: routePro.accentText }}>•</span>
            <span>Nessuna carta richiesta</span>
          </div>

          {/* WORKFLOW VISUAL */}
          <div
            style={{
              margin: "42px auto 0",
              maxWidth: 860,
              padding: "22px 18px",
              borderRadius: 24,
              background: "rgba(8,17,31,0.68)",
              border: `1px solid ${routePro.accentBorder}`,
              boxShadow: "0 22px 70px rgba(0,0,0,0.18)",
            }}
          >
            <p
              style={{
                margin: "0 0 18px",
                color: ndwTokens.colors.textMuted,
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Il workflow RoutePro
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(6, minmax(0, 1fr))",
                gap: 4,
                alignItems: "start",
              }}
            >
              {workflow.map((step, index) => (
                <div
                  key={step}
                  style={{
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      margin: "0 auto",
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background:
                        index === 0
                          ? routePro.accent
                          : ndwTokens.colors.surfaceRaised,
                      color:
                        index === 0
                          ? "#FFFFFF"
                          : ndwTokens.colors.textMuted,
                      border:
                        index === 0
                          ? `1px solid ${routePro.accentHighlight}`
                          : `1px solid ${ndwTokens.colors.borderStrong}`,
                      fontWeight: 950,
                      fontSize: 12,
                      boxShadow:
                        index === 0
                          ? "0 0 0 5px rgba(255,122,0,0.10)"
                          : "none",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "clamp(7px, 2.1vw, 11px)",
fontWeight: 850,
color:
  index === 0
    ? routePro.accentText
    : ndwTokens.colors.textSecondary,
whiteSpace: "nowrap",
overflow: "visible",
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ padding: "12px 20px 64px" }}>
        <div
          style={{
            ...cardStyle,
            maxWidth: 1040,
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 40px)",
          }}
        >
          <p style={sectionLabelStyle}>Prima della partenza</p>

          <h2
            style={{
              margin: "12px 0 0",
              maxWidth: 820,
              fontSize: "clamp(30px, 5vw, 46px)",
              lineHeight: 1.1,
              fontWeight: 950,
            }}
          >
            Una rotta disordinata ti fa perdere tempo ancora prima di iniziare.
          </h2>

          <p
            style={{
              margin: "20px 0 0",
              maxWidth: 820,
              color: ndwTokens.colors.textSecondary,
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.7,
            }}
          >
            Screenshot, indirizzi da controllare, stop lontani tra loro e
            sequenze che ti fanno tornare più volte nella stessa zona.
            RoutePro raccoglie queste operazioni in un unico flusso pensato
            per chi lavora davvero su strada.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "18px 20px 72px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={sectionLabelStyle}>Un unico workflow</p>

          <h2
            style={{
              margin: "12px 0 30px",
              maxWidth: 760,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 950,
              lineHeight: 1.08,
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
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    display: "grid",
                    placeItems: "center",
                    background: routePro.accentSoft,
                    color: routePro.accentText,
                    border: `1px solid ${routePro.accentBorder}`,
                    fontWeight: 950,
                  }}
                >
                  {index + 1}
                </div>

                <h3
                  style={{
                    margin: "18px 0 10px",
                    fontSize: 21,
                    fontWeight: 900,
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

      {/* COME FUNZIONA */}
      <section
        id="come-funziona"
        style={{ padding: "24px 20px 72px" }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={sectionLabelStyle}>Come funziona</p>

          <h2
            style={{
              margin: "12px 0 30px",
              maxWidth: 760,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 950,
              lineHeight: 1.08,
            }}
          >
            Sei passaggi. Un solo flusso.
          </h2>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {workflow.map((step, index) => (
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
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background:
                      index === 0
                        ? routePro.accent
                        : routePro.accentSoft,
                    color:
                      index === 0
                        ? "#FFFFFF"
                        : routePro.accentText,
                    border: `1px solid ${routePro.accentBorder}`,
                    fontWeight: 950,
                  }}
                >
                  {index + 1}
                </div>

                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 850,
                  }}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "30px 20px 78px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              maxWidth: 760,
              margin: "0 auto 34px",
            }}
          >
            <p style={sectionLabelStyle}>Lancio RoutePro</p>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: "clamp(34px, 5vw, 50px)",
                fontWeight: 950,
                lineHeight: 1.08,
              }}
            >
              Parti gratis.
              <br />
              Se ti serve davvero, tienilo.
            </h2>

            <p
              style={{
                margin: "16px auto 0",
                color: ndwTokens.colors.textSecondary,
                lineHeight: 1.65,
                fontSize: 16,
              }}
            >
              I primi 100 nuovi clienti possono ottenere automaticamente
              il prezzo Founding Driver.
            </p>
          </div>

          <article
            style={{
              position: "relative",
              maxWidth: 720,
              margin: "0 auto",
              padding: "clamp(26px, 6vw, 42px)",
              borderRadius: 28,
              overflow: "hidden",
              background: `
                radial-gradient(circle at top right, ${routePro.accentSoft}, transparent 42%),
                linear-gradient(
                  180deg,
                  ${ndwTokens.colors.surfaceSoft},
                  ${ndwTokens.colors.surface}
                )
              `,
              border: `1px solid ${routePro.accentBorder}`,
              boxShadow: "0 22px 70px rgba(255,122,0,0.10)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 11px",
                borderRadius: 999,
                background: ndwTokens.colors.successSoft,
                color: "#86EFAC",
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: "0.04em",
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
                margin: "22px 0 0",
                color: routePro.accentText,
                fontWeight: 950,
                fontSize: 18,
              }}
            >
              Founding Driver
            </p>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "4px 8px",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(46px, 9vw, 62px)",
                  lineHeight: 1,
                  fontWeight: 950,
                  letterSpacing: "-0.04em",
                }}
              >
                €19,99
              </span>

              <span
                style={{
                  color: ndwTokens.colors.textMuted,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                / mese · IVA inclusa
              </span>
            </div>

            <p
              style={{
                margin: "18px 0 0",
                color: ndwTokens.colors.textSecondary,
                lineHeight: 1.65,
                fontSize: 16,
              }}
            >
              Tutto RoutePro. Prezzo di lancio riservato ai primi 100 clienti.
            </p>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gap: 12,
              }}
            >
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    color: ndwTokens.colors.textPrimary,
                    fontSize: 15,
                    lineHeight: 1.5,
                    fontWeight: 750,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "0 0 auto",
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: ndwTokens.colors.successSoft,
                      color: "#86EFAC",
                      fontSize: 12,
                      fontWeight: 950,
                    }}
                  >
                    ✓
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 28,
                padding: "16px 18px",
                borderRadius: 16,
                background: routePro.accentSoft,
                border: `1px solid ${routePro.accentBorder}`,
                color: ndwTokens.colors.textSecondary,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Mantieni €19,99/mese finché l&apos;abbonamento resta attivo
              senza interruzioni.
            </div>

            <div style={{ marginTop: 28 }}>
              <a
                href="/app/routepro"
                style={{
                  ...primaryCtaStyle,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                Inizia la prova gratuita
              </a>
            </div>

            <p
              style={{
                margin: "14px 0 0",
                textAlign: "center",
                color: ndwTokens.colors.textMuted,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              7 giorni o 5 rotte AI, a seconda di quale limite viene
              raggiunto per primo. Nessuna carta richiesta.
            </p>
          </article>

          <div
            style={{
              maxWidth: 720,
              margin: "18px auto 0",
              padding: "16px 18px",
              textAlign: "center",
              color: ndwTokens.colors.textMuted,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Prezzo standard RoutePro:{" "}
            <strong style={{ color: ndwTokens.colors.textPrimary }}>
              €29,99/mese IVA inclusa
            </strong>{" "}
            dopo l&apos;assegnazione dei primi 100 posti Founding Driver.
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "28px 20px 82px" }}>
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "clamp(32px, 7vw, 56px) 24px",
            textAlign: "center",
            borderRadius: 30,
            background: `
              radial-gradient(circle at top, ${routePro.accentSoft} 0%, transparent 58%),
              linear-gradient(
                135deg,
                ${ndwTokens.colors.surfaceRaised},
                ${ndwTokens.colors.surface}
              )
            `,
            border: `1px solid ${routePro.accentBorder}`,
            boxShadow: ndwTokens.shadows.md,
          }}
        >
          <Image
            src="/brand/routepro/routepro-symbol-master.png"
            alt="RoutePro"
            width={88}
            height={88}
            style={{
              width: 76,
              height: 76,
              objectFit: "contain",
            }}
          />

          <h2
            style={{
              margin: "18px 0 0",
              fontSize: "clamp(34px, 6vw, 54px)",
              lineHeight: 1.06,
              fontWeight: 950,
              letterSpacing: "-0.035em",
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
              maxWidth: 680,
              margin: "20px auto 0",
              color: ndwTokens.colors.textSecondary,
              fontSize: 17,
              lineHeight: 1.65,
            }}
          >
            Prova RoutePro direttamente sul campo e valuta se il workflow
            migliora davvero il tuo modo di preparare e gestire le consegne.
          </p>

          <div style={{ marginTop: 30 }}>
            <a href="/app/routepro" style={primaryCtaStyle}>
              Prova RoutePro gratis
            </a>
          </div>

          <p
            style={{
              margin: "16px 0 0",
              color: ndw.accentText,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Un prodotto NDW · Nota Digital Works
          </p>
        </div>
      </section>
    </main>
  );
}