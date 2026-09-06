export default function RouteProLandingPage() {
  const features = [
    {
      title: "Import intelligente",
      text: "Carica gli screenshot della tua lista di consegne. RoutePro estrae gli stop e prepara i dati per la verifica.",
    },
    {
      title: "Controllo prima di partire",
      text: "Rivedi indirizzi e stop prima della geocodifica, così mantieni il controllo sulla rotta.",
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
    "Geocodifica e ottimizza",
    "Parti e gestisci il giro da RoutePro",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #08111f 0%, #0b1220 45%, #08111f 100%)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* HERO */}
      <section
        style={{
          padding: "88px 20px 72px",
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
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.08)",
              color: "#86efac",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            NDW RoutePro
          </div>

          <h1
            style={{
              maxWidth: 900,
              margin: "24px auto 0",
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
            Più semplice da guidare.
          </h1>

          <p
            style={{
              maxWidth: 720,
              margin: "28px auto 0",
              color: "#cbd5e1",
              fontSize: "clamp(17px, 2vw, 20px)",
              lineHeight: 1.65,
            }}
          >
            RoutePro trasforma screenshot e liste di consegna in una rotta
            verificabile, geocodificata e ottimizzata, accompagnandoti dalla
            preparazione fino all&apos;ultimo stop.
          </p>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <a
              href="/app/routepro"
              style={{
                display: "inline-block",
                background: "#22c55e",
                color: "#052e16",
                padding: "16px 28px",
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Prova RoutePro
            </a>

            <a
              href="#come-funziona"
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.05)",
                color: "#f8fafc",
                padding: "16px 28px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
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
              marginTop: 16,
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            7 giorni o 5 rotte AI di prova, ciò che arriva prima. Nessuna carta
            richiesta.
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section
        style={{
          padding: "24px 20px 72px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "36px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontWeight: 800,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Prima della partenza
          </p>

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
              margin: "20px 0 0",
              maxWidth: 780,
              color: "#cbd5e1",
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            Screenshot, indirizzi da controllare, stop lontani tra loro e
            sequenze che ti fanno tornare più volte nella stessa zona.
            RoutePro raccoglie queste operazioni in un unico flusso pensato per
            chi lavora davvero su strada.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: "32px 20px 80px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#86efac",
              fontWeight: 800,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            Un unico workflow
          </p>

          <h2
            style={{
              margin: "12px 0 32px",
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
            {features.map((feature) => (
              <article
                key={feature.title}
                style={{
                  padding: 26,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(34,197,94,0.12)",
                    color: "#86efac",
                    fontWeight: 900,
                  }}
                >
                  ✓
                </div>

                <h3
                  style={{
                    margin: "20px 0 10px",
                    fontSize: 20,
                    fontWeight: 850,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#cbd5e1",
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
        style={{
          padding: "36px 20px 88px",
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
              maxWidth: 720,
            }}
          >
            <p
              style={{
                color: "#86efac",
                fontWeight: 800,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              Come funziona
            </p>

            <h2
              style={{
                margin: "12px 0 32px",
                fontSize: "clamp(32px, 4vw, 46px)",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Quattro passaggi. Una sola rotta.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {flow.map((step, index) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "18px 22px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
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
                    background: "#22c55e",
                    color: "#052e16",
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </div>

                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 750,
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
      <section
        style={{
          padding: "32px 20px 88px",
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
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 36px",
            }}
          >
            <p
              style={{
                color: "#86efac",
                fontWeight: 800,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              Lancio RoutePro
            </p>

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
            <article
              style={{
                padding: 30,
                borderRadius: 22,
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.35)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#86efac",
                  fontWeight: 900,
                }}
              >
                Founding Driver
              </p>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 40,
                  fontWeight: 900,
                }}
              >
                €19,99
                <span
                  style={{
                    fontSize: 15,
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  / mese + IVA
                </span>
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                  lineHeight: 1.65,
                }}
              >
                Riservato ai primi 100 clienti. Il prezzo resta invariato finché
                l&apos;abbonamento rimane attivo senza interruzioni.
              </p>
            </article>

            <article
              style={{
                padding: 30,
                borderRadius: 22,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#e2e8f0",
                  fontWeight: 900,
                }}
              >
                RoutePro Standard
              </p>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 40,
                  fontWeight: 900,
                }}
              >
                €29,99
                <span
                  style={{
                    fontSize: 15,
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  / mese + IVA
                </span>
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                  lineHeight: 1.65,
                }}
              >
                Il piano pubblico RoutePro dopo l&apos;esaurimento dei primi
                100 posti Founding Driver.
              </p>
            </article>
          </div>

          <div
            style={{
              marginTop: 32,
              textAlign: "center",
            }}
          >
            <a
              href="/app/routepro"
              style={{
                display: "inline-block",
                background: "#22c55e",
                color: "#052e16",
                padding: "16px 30px",
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Inizia la prova gratuita
            </a>

            <p
              style={{
                maxWidth: 620,
                margin: "14px auto 0",
                color: "#94a3b8",
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
      <section
        style={{
          padding: "40px 20px 100px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "54px 28px",
            textAlign: "center",
            borderRadius: 28,
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(34,197,94,0.04))",
            border: "1px solid rgba(34,197,94,0.28)",
          }}
        >
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
            Più tempo per consegnare.
          </h2>

          <p
            style={{
              maxWidth: 650,
              margin: "20px auto 0",
              color: "#cbd5e1",
              fontSize: 17,
              lineHeight: 1.65,
            }}
          >
            Prova il workflow completo di RoutePro e valuta direttamente sul
            campo se migliora il tuo modo di lavorare.
          </p>

          <div
            style={{
              marginTop: 30,
            }}
          >
            <a
              href="/app/routepro"
              style={{
                display: "inline-block",
                background: "#22c55e",
                color: "#052e16",
                padding: "16px 30px",
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Prova RoutePro
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}