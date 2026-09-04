"use client";

import { useEffect, useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

type RouteProCheckoutClientProps = {
  email: string;
};

type WhopEnvironment =
  | "production"
  | "sandbox";

type RouteProOffer =
  | "founding_driver"
  | "standard";

type CheckoutResponse = {
  ok: boolean;
  sessionId?: string;
  returnUrl?: string | null;
  environment?: WhopEnvironment;
  offer?: RouteProOffer;
  error?: string;
};

export default function RouteProCheckoutClient({
  email,
}: RouteProCheckoutClientProps) {
  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [returnUrl, setReturnUrl] =
    useState<string | null>(null);

  const [environment, setEnvironment] =
    useState<WhopEnvironment>("production");

  const [offer, setOffer] =
    useState<RouteProOffer | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createCheckout() {
      try {
        const response = await fetch(
          "/api/whop/checkout/routepro",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data =
          (await response.json()) as CheckoutResponse;

        if (cancelled) return;

        if (
          !response.ok ||
          !data.ok ||
          !data.sessionId ||
          !data.offer
        ) {
          setError(
            "Non è stato possibile preparare il pagamento. Riprova tra poco.",
          );
          return;
        }

        setSessionId(data.sessionId);
        setReturnUrl(
          data.returnUrl ?? null,
        );
        setEnvironment(
          data.environment ?? "production",
        );
        setOffer(data.offer);
      } catch {
        if (!cancelled) {
          setError(
            "Non è stato possibile collegarsi al servizio di pagamento.",
          );
        }
      }
    }

    void createCheckout();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          border:
            "1px solid rgba(248,113,113,0.35)",
          background:
            "rgba(127,29,29,0.15)",
        }}
      >
        <strong>
          Pagamento temporaneamente non disponibile
        </strong>

        <p style={{ marginBottom: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  if (!sessionId || !offer) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Preparazione del checkout sicuro…
      </div>
    );
  }

  const isFounder =
    offer === "founding_driver";

  return (
    <>
      <h1
        style={{
          margin: "0",
          fontSize: 34,
          lineHeight: 1.1,
        }}
      >
        {isFounder
          ? "Founding Driver"
          : "RoutePro Standard"}
      </h1>

      <p
        style={{
          marginTop: 12,
          marginBottom: 24,
          color: "#cbd5e1",
          lineHeight: 1.6,
        }}
      >
        {isFounder ? (
          <>
            €19,99 al mese. Prezzo riservato ai primi
            100 Founding Driver e mantenuto finché
            l&apos;abbonamento rimane attivo.
          </>
        ) : (
          <>
            €29,99 al mese. Piano RoutePro Standard.
          </>
        )}
      </p>

      <div
        style={{
          padding: 20,
          borderRadius: 20,
          background: "#111827",
          border:
            "1px solid rgba(148,163,184,0.18)",
        }}
      >
        <WhopCheckoutEmbed
          sessionId={sessionId}
          environment={environment}
          {...(returnUrl
            ? { returnUrl }
            : {})}
          prefill={{ email }}
          hideEmail
          disableEmail
        />
      </div>

      <p
        style={{
          marginTop: 18,
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        Pagamento sicuro. Il tuo account RoutePro
        rimane collegato al tuo profilo NDW.
      </p>
    </>
  );
}
