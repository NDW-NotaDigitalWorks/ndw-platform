import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type HomePageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}&next=/app`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top left, ${ndwTokens.colors.primarySoft} 0, transparent 34%), ${ndwTokens.colors.background}`,
        color: ndwTokens.colors.textPrimary,
        padding: "72px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: ndwTokens.radius.lg,
              overflow: "hidden",
              border: `1px solid ${ndwTokens.colors.borderStrong}`,
              background: ndwTokens.colors.surfaceSoft,
            }}
          >
            <Image
              src="/brand/ndw/icon/ndw-mark.png"
              alt="NDW"
              width={52}
              height={52}
              priority
            />
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: ndwTokens.colors.primary,
              }}
            >
              NDW Core
            </p>

            <p
              style={{
                margin: "4px 0 0",
                color: ndwTokens.colors.textMuted,
                fontSize: 14,
              }}
            >
              Nota Digital Works
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 72,
            maxWidth: 760,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(56px, 10vw, 108px)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              color: ndwTokens.colors.textPrimary,
              fontWeight: 800,
            }}
          >
            Operational
            <br />
            workspace
            <br />
            ecosystem.
          </h1>

          <p
            style={{
              marginTop: 28,
              maxWidth: 680,
              fontSize: 20,
              lineHeight: 1.7,
              color: ndwTokens.colors.textSecondary,
            }}
          >
            NDW Core è la piattaforma centrale di Nota Digital Works:
            moduli, accessi, strumenti operativi e workspace modulari
            per micro-business, freelance e operatori digitali.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 38,
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: ndwTokens.radius.lg,
                background: ndwTokens.colors.primary,
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 800,
                boxShadow: ndwTokens.shadows.accent,
              }}
            >
              Accedi al workspace
            </Link>

            <Link
              href="/app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: ndwTokens.radius.lg,
                border: `1px solid ${ndwTokens.colors.borderStrong}`,
                background: ndwTokens.colors.surfaceSoft,
                color: ndwTokens.colors.textPrimary,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Apri NDW Core
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 72,
            maxWidth: 760,
            padding: ndwTokens.spacing.xl,
            borderRadius: ndwTokens.radius["2xl"],
            border: `1px solid ${ndwTokens.colors.border}`,
            background: `linear-gradient(180deg, ${ndwTokens.colors.surfaceSoft} 0%, ${ndwTokens.colors.surface} 100%)`,
            boxShadow: ndwTokens.shadows.sm,
          }}
        >
          <p
            style={{
              margin: 0,
              color: ndwTokens.colors.textSecondary,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Piattaforma modulare in fase di evoluzione.
            I moduli disponibili saranno accessibili in base
            al piano e agli entitlement attivi sul tuo account.
          </p>
        </div>
      </div>
    </main>
  );
}