"use client";

import { useEffect, useState } from "react";

type ActivationState =
  | "checking"
  | "active"
  | "waiting"
  | "error";

type StatusResponse = {
  ok: boolean;
  active?: boolean;
  provider?: string | null;
  planCode?: string | null;
};

export default function RouteProActivationStatus() {
  const [state, setState] = useState<ActivationState>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function checkStatus(currentAttempt: number) {
      try {
        const response = await fetch(
          "/api/whop/checkout/routepro/status",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = (await response.json()) as StatusResponse;

        if (cancelled) return;

        if (response.ok && data.ok && data.active) {
          setState("active");
          return;
        }

        if (currentAttempt >= 11) {
          setState("waiting");
          return;
        }

        setAttempt(currentAttempt + 1);

        timeoutId = setTimeout(() => {
          void checkStatus(currentAttempt + 1);
        }, 2500);
      } catch {
        if (cancelled) return;

        if (currentAttempt >= 11) {
          setState("error");
          return;
        }

        setAttempt(currentAttempt + 1);

        timeoutId = setTimeout(() => {
          void checkStatus(currentAttempt + 1);
        }, 2500);
      }
    }

    void checkStatus(0);

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (state === "active") {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 20,
          border: "1px solid rgba(34,197,94,0.35)",
          background: "rgba(20,83,45,0.18)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 38,
            marginBottom: 12,
          }}
        >
          ✓
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          RoutePro è attivo
        </h2>

        <p
          style={{
            margin: "10px 0 22px",
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          Il pagamento è stato confermato e il tuo account è pronto.
        </p>

        <a
          href="/app/routepro"
          style={{
            display: "inline-block",
            padding: "13px 22px",
            borderRadius: 12,
            background: "#22c55e",
            color: "#052e16",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          Apri RoutePro
        </a>
      </div>
    );
  }

  if (state === "waiting") {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 20,
          border: "1px solid rgba(250,204,21,0.3)",
          background: "rgba(113,63,18,0.16)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Pagamento ricevuto
        </h2>

        <p
          style={{
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          L'attivazione di RoutePro sta richiedendo qualche secondo
          in più. Non effettuare un nuovo pagamento.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "12px 18px",
            borderRadius: 12,
            border: 0,
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Controlla di nuovo
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 20,
          border: "1px solid rgba(248,113,113,0.35)",
          background: "rgba(127,29,29,0.15)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Verifica in corso
        </h2>

        <p
          style={{
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          Non siamo riusciti a verificare subito l'attivazione.
          Non effettuare un secondo pagamento.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "12px 18px",
            borderRadius: 12,
            border: 0,
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 28,
        borderRadius: 20,
        background: "#111827",
        border: "1px solid rgba(148,163,184,0.18)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 30,
          marginBottom: 12,
        }}
      >
        ◌
      </div>

      <h2 style={{ margin: 0 }}>
        Attivazione RoutePro…
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          lineHeight: 1.6,
          marginBottom: 0,
        }}
      >
        Pagamento completato. Stiamo verificando l'attivazione
        del tuo account.
      </p>

      <p
        style={{
          color: "#64748b",
          fontSize: 12,
          marginTop: 14,
        }}
      >
        Verifica {attempt + 1}
      </p>
    </div>
  );
}