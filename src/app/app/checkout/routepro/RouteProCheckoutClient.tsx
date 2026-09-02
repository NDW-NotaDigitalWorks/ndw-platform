"use client";

import { useEffect, useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

type RouteProCheckoutClientProps = {
  email: string;
};

type WhopEnvironment = "production" | "sandbox";

type CheckoutResponse = {
  ok: boolean;
  sessionId?: string;
  returnUrl?: string | null;
  environment?: WhopEnvironment;
  error?: string;
};

export default function RouteProCheckoutClient({
  email,
}: RouteProCheckoutClientProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [environment, setEnvironment] =
    useState<WhopEnvironment>("production");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createCheckout() {
      try {
        const response = await fetch("/api/whop/checkout/routepro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await response.json()) as CheckoutResponse;

        if (cancelled) return;

        if (!response.ok || !data.ok || !data.sessionId) {
          setError(
            "Non è stato possibile preparare il pagamento. Riprova tra poco.",
          );
          return;
        }

        setSessionId(data.sessionId);
        setReturnUrl(data.returnUrl ?? null);
        setEnvironment(data.environment ?? "production");
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
          border: "1px solid rgba(248,113,113,0.35)",
          background: "rgba(127,29,29,0.15)",
        }}
      >
        <strong>Pagamento temporaneamente non disponibile</strong>
        <p style={{ marginBottom: 0 }}>{error}</p>
      </div>
    );
  }

  if (!sessionId) {
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

  return (
    <WhopCheckoutEmbed
      sessionId={sessionId}
      environment={environment}
      {...(returnUrl ? { returnUrl } : {})}
      prefill={{ email }}
      hideEmail
      disableEmail
    />
  );
}