"use client";

import { useMemo, useState } from "react";

type Stop = {
  id: string;
  position: number;
  original_position: number | null;
  address: string | null;
  status: string;
  source: string | null;
};

const PAGE_SIZE = 25;

const wrapperStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 20,
};

const stickyToolbarStyle: React.CSSProperties = {
  position: "sticky",
  top: 12,
  zIndex: 20,
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 20,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(15,23,42,0.94)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.28)",
  backdropFilter: "blur(16px)",
};

const toolbarSummaryStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
};

const toolbarTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 15,
  lineHeight: 1.2,
  fontWeight: 950,
};

const toolbarStatusStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
};

const summaryBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 30,
  padding: "5px 10px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.055)",
  color: "#cbd5e1",
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 900,
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  boxSizing: "border-box",
  borderRadius: 15,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(255,255,255,0.06)",
  padding: "0 14px",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 750,
  outline: "none",
};

const sectionCardStyle: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg,#172033 0%,#111827 100%)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.2)",
};

const sectionButtonStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: 16,
  border: 0,
  background: "transparent",
  color: "#ffffff",
  textAlign: "left",
  cursor: "pointer",
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 17,
  lineHeight: 1.25,
  fontWeight: 950,
};

const sectionDescriptionStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.4,
  fontWeight: 700,
};

const sectionToggleStyle: React.CSSProperties = {
  flexShrink: 0,
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
};

const sectionContentStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: "0 12px 12px",
};

const compactRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  minWidth: 0,
  padding: "11px 12px",
  borderRadius: 15,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
};

const reviewRowStyle: React.CSSProperties = {
  ...compactRowStyle,
  background:
    "linear-gradient(180deg,rgba(245,158,11,0.1) 0%,rgba(15,23,42,0.72) 100%)",
  border: "1px solid rgba(251,191,36,0.22)",
};

const stopNumberStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 78,
  padding: "7px 9px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  border: "1px solid rgba(96,165,250,0.24)",
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 950,
};

const stopContentStyle: React.CSSProperties = {
  flex: "1 1 180px",
  minWidth: 0,
};

const addressTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  lineHeight: 1.35,
  fontWeight: 850,
  overflowWrap: "anywhere",
};

const workflowTextStyle: React.CSSProperties = {
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.3,
  fontWeight: 750,
};

const badgeBaseStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 30,
  marginLeft: "auto",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 950,
};

const verifiedBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  background: "rgba(34,197,94,0.12)",
  color: "#bbf7d0",
  border: "1px solid rgba(74,222,128,0.24)",
};

const reviewBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  background: "rgba(245,158,11,0.12)",
  color: "#fde68a",
  border: "1px solid rgba(251,191,36,0.26)",
};

const rawBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  background: "rgba(239,68,68,0.12)",
  color: "#fecaca",
  border: "1px solid rgba(248,113,113,0.24)",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(74,222,128,0.22)",
};

const loadMoreButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  marginTop: 4,
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(59,130,246,0.12)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};

const noResultsStyle: React.CSSProperties = {
  padding: "18px 16px",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.16)",
  background: "rgba(255,255,255,0.035)",
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 750,
};

function statusLabel(status: string): string {
  if (status === "valid") return "Verificato";
  if (status === "completed") return "Completato";
  if (status === "skipped") return "Saltato";
  if (status === "needs_review") return "Da controllare";
  if (status === "raw") return "Non elaborato";

  return status;
}

function isVerifiedStatus(status: string): boolean {
  return ["valid", "completed", "skipped"].includes(status);
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  if (isVerifiedStatus(status)) {
    return verifiedBadgeStyle;
  }

  if (status === "raw") {
    return rawBadgeStyle;
  }

  return reviewBadgeStyle;
}

function StopRow({
  stop,
  requiresAttention,
}: {
  stop: Stop;
  requiresAttention: boolean;
}) {
  const originalNumber = stop.original_position ?? stop.position;
  const address = stop.address?.trim() || "Indirizzo non disponibile";

  return (
    <div style={requiresAttention ? reviewRowStyle : compactRowStyle}>
      <span style={stopNumberStyle}>Orig. #{originalNumber}</span>

      <div style={stopContentStyle}>
        <div style={addressTextStyle}>{address}</div>

        <div style={workflowTextStyle}>
          Workflow #{stop.position}
          {stop.source ? ` · Origine: ${stop.source}` : ""}
        </div>
      </div>

      <span style={getStatusBadgeStyle(stop.status)}>
        {statusLabel(stop.status)}
      </span>
    </div>
  );
}

export function RouteProReviewStopsClient({ stops }: { stops: Stop[] }) {
  const [query, setQuery] = useState("");
  const [showReview, setShowReview] = useState(true);
  const [showVerified, setShowVerified] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(PAGE_SIZE);
  const [visibleVerifiedCount, setVisibleVerifiedCount] = useState(PAGE_SIZE);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredStops = useMemo(() => {
    if (!normalizedQuery) {
      return stops;
    }

    return stops.filter((stop) => {
      const originalNumber = String(stop.original_position ?? "");
      const workflowNumber = String(stop.position ?? "");
      const address = stop.address?.toLowerCase() ?? "";
      const status = statusLabel(stop.status).toLowerCase();
      const source = stop.source?.toLowerCase() ?? "";

      return (
        originalNumber.includes(normalizedQuery) ||
        workflowNumber.includes(normalizedQuery) ||
        address.includes(normalizedQuery) ||
        status.includes(normalizedQuery) ||
        source.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, stops]);

  const reviewStops = useMemo(
    () =>
      filteredStops.filter(
        (stop) =>
          stop.status === "needs_review" || stop.status === "raw",
      ),
    [filteredStops],
  );

  const verifiedStops = useMemo(
    () =>
      filteredStops.filter((stop) => isVerifiedStatus(stop.status)),
    [filteredStops],
  );

  const totalReviewStops = stops.filter(
    (stop) => stop.status === "needs_review" || stop.status === "raw",
  ).length;

  const totalVerifiedStops = stops.filter((stop) =>
    isVerifiedStatus(stop.status),
  ).length;

  const visibleReviewStops = normalizedQuery
    ? reviewStops
    : reviewStops.slice(0, visibleReviewCount);

  const visibleVerifiedStops = normalizedQuery
    ? verifiedStops
    : verifiedStops.slice(0, visibleVerifiedCount);

  const hasSearchResults = filteredStops.length > 0;

  return (
    <div style={wrapperStyle}>
      <div style={stickyToolbarStyle}>
        <div style={toolbarSummaryStyle}>
          <p style={toolbarTitleStyle}>Gestione stop</p>

          <div style={toolbarStatusStyle}>
            <span style={summaryBadgeStyle}>{stops.length} totali</span>

            <span style={summaryBadgeStyle}>
              {totalReviewStops} da controllare
            </span>

            <span style={summaryBadgeStyle}>
              {totalVerifiedStops} confermati
            </span>
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleReviewCount(PAGE_SIZE);
            setVisibleVerifiedCount(PAGE_SIZE);

            if (event.target.value.trim()) {
              setShowReview(true);
              setShowVerified(true);
            }
          }}
          placeholder="Cerca numero stop, indirizzo, stato o origine..."
          aria-label="Cerca negli stop della rotta"
          style={searchStyle}
        />
      </div>

      {!hasSearchResults ? (
        <div style={noResultsStyle}>
          Nessuno stop corrisponde alla ricerca “{query.trim()}”.
        </div>
      ) : null}

      {hasSearchResults ? (
        <>
          <section style={sectionCardStyle}>
            <button
              type="button"
              onClick={() => setShowReview((value) => !value)}
              aria-expanded={showReview}
              style={sectionButtonStyle}
            >
              <div>
                <h3 style={sectionHeadingStyle}>
                  Stop da controllare ({reviewStops.length})
                </h3>

                <p style={sectionDescriptionStyle}>
                  Indirizzi incompleti, grezzi o che richiedono attenzione.
                </p>
              </div>

              <span style={sectionToggleStyle}>
                {showReview ? "Nascondi" : "Mostra"}
              </span>
            </button>

            {showReview ? (
              <div style={sectionContentStyle}>
                {reviewStops.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <p
                      style={{
                        margin: 0,
                        color: "#d1fae5",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      Tutti gli stop sono stati controllati.
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#a7f3d0",
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      Puoi continuare con la verifica degli indirizzi.
                    </p>
                  </div>
                ) : (
                  <>
                    {visibleReviewStops.map((stop) => (
                      <StopRow
                        key={stop.id}
                        stop={stop}
                        requiresAttention
                      />
                    ))}

                    {!normalizedQuery &&
                    visibleReviewCount < reviewStops.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleReviewCount(
                            (value) => value + PAGE_SIZE,
                          )
                        }
                        style={loadMoreButtonStyle}
                      >
                        Mostra altri{" "}
                        {Math.min(
                          PAGE_SIZE,
                          reviewStops.length - visibleReviewCount,
                        )}{" "}
                        stop
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </section>

          <section style={sectionCardStyle}>
            <button
              type="button"
              onClick={() => setShowVerified((value) => !value)}
              aria-expanded={showVerified}
              style={sectionButtonStyle}
            >
              <div>
                <h3 style={sectionHeadingStyle}>
                  Stop confermati ({verifiedStops.length})
                </h3>

                <p style={sectionDescriptionStyle}>
                  Elenco chiuso per ridurre lo scroll durante la Review.
                </p>
              </div>

              <span style={sectionToggleStyle}>
                {showVerified ? "Nascondi" : "Mostra"}
              </span>
            </button>

            {showVerified ? (
              <div style={sectionContentStyle}>
                {verifiedStops.length === 0 ? (
                  <div style={noResultsStyle}>
                    Non ci sono ancora stop confermati.
                  </div>
                ) : (
                  <>
                    {visibleVerifiedStops.map((stop) => (
                      <StopRow
                        key={stop.id}
                        stop={stop}
                        requiresAttention={false}
                      />
                    ))}

                    {!normalizedQuery &&
                    visibleVerifiedCount < verifiedStops.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleVerifiedCount(
                            (value) => value + PAGE_SIZE,
                          )
                        }
                        style={loadMoreButtonStyle}
                      >
                        Mostra altri{" "}
                        {Math.min(
                          PAGE_SIZE,
                          verifiedStops.length - visibleVerifiedCount,
                        )}{" "}
                        stop
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}