"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Stop = {
  id: string;
  position: number;
  original_position: number | null;
  address: string | null;
  status: string;
  lat: number | null;
  lng: number | null;
};

const panelStyle: CSSProperties = {
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.075)",
  background:
    "linear-gradient(180deg,rgba(30,41,59,0.94) 0%,rgba(15,23,42,0.98) 100%)",
  padding: "16px clamp(14px, 2vw, 18px)",
  boxShadow: "0 16px 38px rgba(0,0,0,0.18)",
};

const compactRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "104px minmax(0,1fr) auto",
  gap: 12,
  alignItems: "center",
  padding: "11px 12px",
  borderRadius: 15,
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.035)",
};

const stopNumberStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 76,
  padding: "6px 9px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.12)",
  color: "#bfdbfe",
  border: "1px solid rgba(96,165,250,0.22)",
  fontSize: 12,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

const addressStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 850,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const detailStyle: CSSProperties = {
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.35,
  fontWeight: 750,
};

const searchWrapperStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchIconStyle: CSSProperties = {
  position: "absolute",
  left: 16,
  color: "#64748b",
  fontSize: 15,
  fontWeight: 950,
  pointerEvents: "none",
};

const searchStyle: CSSProperties = {
  width: "100%",
  minHeight: 50,
  boxSizing: "border-box",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.18)",
  background:
    "linear-gradient(180deg,rgba(30,41,59,0.92) 0%,rgba(15,23,42,0.98) 100%)",
  padding: "0 46px 0 43px",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
  boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
};

const clearButtonStyle: CSSProperties = {
  position: "absolute",
  right: 9,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  padding: 0,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.16)",
  background: "rgba(255,255,255,0.045)",
  color: "#cbd5e1",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
};

const verifiedBadgeStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "6px 9px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.11)",
  color: "#bbf7d0",
  border: "1px solid rgba(74,222,128,0.22)",
  fontSize: 11,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

const warningBadgeStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "6px 9px",
  borderRadius: 999,
  background: "rgba(245,158,11,0.11)",
  color: "#fde68a",
  border: "1px solid rgba(251,191,36,0.24)",
  fontSize: 11,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

const issueRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "104px minmax(0,1fr) auto",
  gap: 12,
  alignItems: "center",
  padding: "12px",
  borderRadius: 15,
  background:
    "linear-gradient(90deg,rgba(245,158,11,0.075) 0%,rgba(15,23,42,0.52) 100%)",
  border: "1px solid rgba(251,191,36,0.2)",
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
        gap: 14,
        marginTop: 18,
      }}
    >
      <div style={searchWrapperStyle}>
        <span aria-hidden="true" style={searchIconStyle}>
          ⌕
        </span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca numero originale, posizione o indirizzo..."
          aria-label="Cerca tra gli indirizzi della rotta"
          style={searchStyle}
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Cancella ricerca"
            style={clearButtonStyle}
          >
            ×
          </button>
        ) : null}
      </div>

      {totalIssueStops > 0 ? (
        <section style={panelStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: 17,
                  lineHeight: 1.25,
                  fontWeight: 950,
                }}
              >
                Indirizzi da verificare
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#94a3b8",
                  fontSize: 12,
                  lineHeight: 1.45,
                  fontWeight: 700,
                }}
              >
                Stop ancora privi di coordinate valide o che richiedono attenzione.
              </p>
            </div>

            <span style={warningBadgeStyle}>
              {issueStops.length} visibili
            </span>
          </div>

          {issueStops.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 13,
                maxHeight: 500,
                overflowY: "auto",
                paddingRight: 5,
              }}
            >
              {issueStops.map((stop) => (
                <div key={stop.id} style={issueRowStyle}>
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
                      {hasCoordinates(stop)
                        ? "Coordinate presenti, verifica richiesta"
                        : "Coordinate mancanti"}
                    </div>
                  </div>

                  <span style={warningBadgeStyle}>
                    {hasCoordinates(stop)
                      ? "Da controllare"
                      : "Da geolocalizzare"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                marginTop: 13,
                padding: "13px 15px",
                borderRadius: 15,
                background: "rgba(34,197,94,0.09)",
                border: "1px solid rgba(74,222,128,0.2)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#d1fae5",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Nessun indirizzo da verificare corrisponde alla ricerca.
              </p>
            </div>
          )}
        </section>
      ) : null}

      <section style={panelStyle}>
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
          <span>
            <span
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: 17,
                lineHeight: 1.25,
                fontWeight: 950,
              }}
            >
              Indirizzi geolocalizzati
            </span>

            <span
              style={{
                display: "block",
                marginTop: 4,
                color: "#94a3b8",
                fontSize: 12,
                lineHeight: 1.4,
                fontWeight: 700,
              }}
            >
              {totalVerifiedStops} stop pronti per l'ottimizzazione
            </span>
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#93c5fd",
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {showVerified ? "Nascondi" : "Mostra"}
            <span aria-hidden="true">
              {showVerified ? "▲" : "▼"}
            </span>
          </span>
        </button>

        {showVerified ? (
          verifiedStops.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 7,
                marginTop: 13,
                maxHeight: 540,
                overflowY: "auto",
                paddingRight: 5,
              }}
            >
              {verifiedStops.map((stop) => (
                <div key={stop.id} style={compactRowStyle}>
                  <span style={stopNumberStyle}>
                    Orig. #{stop.original_position ?? stop.position}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <div style={addressStyle}>
                      {stop.address ?? "Indirizzo non disponibile"}
                    </div>

                    <div style={detailStyle}>
                      Posizione RoutePro #{stop.position} · Coordinate valide
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
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Nessun indirizzo geolocalizzato corrisponde alla ricerca.
            </p>
          )
        ) : null}
      </section>

      <style jsx>{`
        input:focus {
          border-color: rgba(96, 165, 250, 0.58) !important;
          box-shadow:
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 14px 34px rgba(0, 0, 0, 0.2) !important;
        }

        @media (max-width: 720px) {
          section div[style*="grid-template-columns: 104px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
