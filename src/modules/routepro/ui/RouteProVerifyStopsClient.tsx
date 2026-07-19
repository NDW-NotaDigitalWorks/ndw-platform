"use client";

import { useMemo, useState } from "react";

type Stop = {
  id: string;
  position: number;
  original_position: number | null;
  address: string | null;
  status: string;
  lat: number | null;
  lng: number | null;
};

const cardStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  padding: 16,
  boxShadow: "0 18px 42px rgba(0,0,0,0.2)",
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px minmax(0,1fr) 150px",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
};

const stopNumberStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 82,
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  border: "1px solid rgba(96,165,250,0.24)",
  fontSize: 13,
  fontWeight: 950,
};

const addressStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 850,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const detailStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 750,
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  boxSizing: "border-box",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  padding: "0 16px",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
  boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
};

const verifiedBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.12)",
  color: "#bbf7d0",
  border: "1px solid rgba(74,222,128,0.24)",
  fontSize: 12,
  fontWeight: 950,
};

const warningBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(245,158,11,0.12)",
  color: "#fde68a",
  border: "1px solid rgba(251,191,36,0.26)",
  fontSize: 12,
  fontWeight: 950,
};

const verifyIssueCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 18,
  background:
    "linear-gradient(180deg,rgba(245,158,11,0.1) 0%,rgba(15,23,42,0.72) 100%)",
  border: "1px solid rgba(251,191,36,0.24)",
  overflow: "hidden",
};

const verifyIssueTopRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

function hasCoordinates(stop: Stop): boolean {
  return (
    typeof stop.lat === "number" &&
    Number.isFinite(stop.lat) &&
    typeof stop.lng === "number" &&
    Number.isFinite(stop.lng)
  );
}

function getIssueStops(stops: Stop[]): Stop[] {
  return stops.filter(
    (stop) =>
      stop.status === "needs_review" ||
      stop.status === "raw" ||
      !hasCoordinates(stop),
  );
}

function getVerifiedStops(stops: Stop[]): Stop[] {
  return stops.filter(
    (stop) => stop.status === "valid" && hasCoordinates(stop),
  );
}

export function RouteProVerifyStopsClient({
  stops,
}: {
  stops: Stop[];
}) {
  const [query, setQuery] = useState("");
  const [showVerified, setShowVerified] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredStops = useMemo(() => {
    if (!normalizedQuery) {
      return stops;
    }

    return stops.filter((stop) => {
      const original = String(stop.original_position ?? "");
      const position = String(stop.position ?? "");
      const address = stop.address?.toLowerCase() ?? "";

      return (
        original.includes(normalizedQuery) ||
        position.includes(normalizedQuery) ||
        address.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, stops]);

  const issueStops = getIssueStops(filteredStops);
  const verifiedStops = getVerifiedStops(filteredStops);

  const totalIssueStops = getIssueStops(stops).length;
  const totalVerifiedStops = getVerifiedStops(stops).length;

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        marginTop: 22,
      }}
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca numero originale, posizione o indirizzo..."
        style={searchStyle}
      />

      {totalIssueStops > 0 ? (
        <section style={cardStyle}>
          <h3
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 950,
            }}
          >
            Indirizzi da geolocalizzare ({issueStops.length})
          </h3>

          <p
            style={{
              margin: "7px 0 0",
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.5,
              fontWeight: 700,
            }}
          >
            Controlla gli indirizzi ancora privi di coordinate valide.
          </p>

          {issueStops.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 14,
                maxHeight: 520,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {issueStops.map((stop) => (
                <div key={stop.id} style={verifyIssueCardStyle}>
                  <div style={verifyIssueTopRowStyle}>
                    <span style={stopNumberStyle}>
                      Orig. #{stop.original_position ?? stop.position}
                    </span>

                    <span style={warningBadgeStyle}>
                      {hasCoordinates(stop)
                        ? "Verifica richiesta"
                        : "Da geolocalizzare"}
                    </span>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={addressStyle}>
                      {stop.address ?? "Indirizzo non disponibile"}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        display: "inline-flex",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(245,158,11,0.12)",
                        color: "#fde68a",
                        border: "1px solid rgba(251,191,36,0.2)",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      Geolocalizzazione richiesta
                    </div>

                    <div style={detailStyle}>
                      Posizione RoutePro #{stop.position}
                    </div>

                    <div style={detailStyle}>
                      {hasCoordinates(stop)
                        ? "Coordinate presenti, verifica richiesta"
                        : "Coordinate mancanti"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                marginTop: 14,
                padding: "14px 16px",
                borderRadius: 16,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(74,222,128,0.22)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#d1fae5",
                  fontWeight: 900,
                }}
              >
                Nessun risultato da verificare.
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#a7f3d0",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Modifica o cancella la ricerca per visualizzare gli altri
                indirizzi.
              </p>
            </div>
          )}
        </section>
      ) : null}

      <section style={cardStyle}>
        <button
          type="button"
          onClick={() => setShowVerified((value) => !value)}
          aria-expanded={showVerified}
          style={{
            width: "100%",
            border: 0,
            background: "transparent",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 950,
            }}
          >
            Indirizzi geolocalizzati ({totalVerifiedStops})
          </span>

          <span
            style={{
              color: "#93c5fd",
              fontSize: 13,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {showVerified ? "Nascondi elenco" : "Mostra elenco"}
          </span>
        </button>

        {showVerified ? (
          verifiedStops.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 14,
                maxHeight: 560,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {verifiedStops.map((stop) => (
                <div key={stop.id} style={rowStyle}>
                  <span style={stopNumberStyle}>
                    Orig. #{stop.original_position ?? stop.position}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <div style={addressStyle}>
                      {stop.address ?? "Indirizzo non disponibile"}
                    </div>

                    <div style={detailStyle}>
                      Posizione RoutePro #{stop.position}
                    </div>

                    <div style={detailStyle}>
                      Coordinate valide · pronto per l’ottimizzazione
                    </div>
                  </div>

                  <span style={verifiedBadgeStyle}>
                    Geolocalizzato
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                margin: "12px 0 0",
                color: "#94a3b8",
                fontWeight: 700,
              }}
            >
              Nessun indirizzo geolocalizzato corrisponde alla ricerca.
            </p>
          )
        ) : (
          <p
            style={{
              margin: "10px 0 0",
              color: "#94a3b8",
              fontWeight: 700,
            }}
          >
            Elenco chiuso per evitare scroll inutile. Aprilo solo per
            controllare un indirizzo specifico.
          </p>
        )}
      </section>
    </div>
  );
}