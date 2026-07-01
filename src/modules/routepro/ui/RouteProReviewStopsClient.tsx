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

const cardStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  padding: 16,
};

const compactRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px 1fr 120px",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const stopNumberStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 82,
  padding: "7px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 950,
};

const addressTextStyle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 850,
  lineHeight: 1.35,
};

const workflowTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 750,
};

const verifiedBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  fontSize: 12,
  fontWeight: 950,
};

const reviewBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
  border: "1px solid #fcd34d",
  fontSize: 12,
  fontWeight: 950,
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
};

function statusLabel(status: string) {
  if (status === "valid") return "Verificato";
  if (status === "needs_review") return "Da controllare";
  if (status === "raw") return "Raw";
  return status;
}

export function RouteProReviewStopsClient({ stops }: { stops: Stop[] }) {
  const [query, setQuery] = useState("");
  const [showVerified, setShowVerified] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredStops = useMemo(() => {
    if (!normalizedQuery) return stops;

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

  const reviewStops = filteredStops.filter(
    (stop) => stop.status === "needs_review" || stop.status === "raw",
  );

  const verifiedStops = filteredStops.filter((stop) => stop.status === "valid");

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca stop, numero o indirizzo..."
        style={searchStyle}
      />

      <section style={cardStyle}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 950, color: "#0f172a" }}>
          Stop da controllare ({reviewStops.length})
        </h3>

        {reviewStops.length === 0 ? (
          <p style={{ margin: "10px 0 0", color: "#047857", fontWeight: 800 }}>
            Nessuno stop richiede intervento. La rotta è pronta per Verify.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {reviewStops.map((stop) => (
              <div key={stop.id} style={{ ...compactRowStyle, background: "#fffbeb" }}>
                <span style={stopNumberStyle}>
  Orig. #{stop.original_position ?? stop.position}
</span>

<div>
  <div style={addressTextStyle}>{stop.address}</div>
  <div style={workflowTextStyle}>Workflow #{stop.position}</div>
</div>

<span style={reviewBadgeStyle}>{statusLabel(stop.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <button
          type="button"
          onClick={() => setShowVerified((value) => !value)}
          style={{
            width: "100%",
            border: 0,
            background: "transparent",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 950, color: "#0f172a" }}>
            Stop verificati ({verifiedStops.length})
          </span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#2563eb" }}>
            {showVerified ? "Nascondi elenco" : "Mostra elenco"}
          </span>
        </button>

        {showVerified ? (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {verifiedStops.map((stop) => (
              <div key={stop.id} style={compactRowStyle}>
                <span style={stopNumberStyle}>
  Orig. #{stop.original_position ?? stop.position}
</span>

<div>
  <div style={addressTextStyle}>{stop.address}</div>
  <div style={workflowTextStyle}>Workflow #{stop.position}</div>
</div>

<span style={verifiedBadgeStyle}>Verificato</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: "10px 0 0", color: "#64748b", fontWeight: 700 }}>
            Elenco chiuso per evitare scroll inutile. Aprilo solo se devi cercare o controllare uno stop.
          </p>
        )}
      </section>
    </div>
  );
}