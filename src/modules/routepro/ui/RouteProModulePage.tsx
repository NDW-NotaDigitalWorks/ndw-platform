import Link from "next/link";
import { getRouteProDictionary } from "@/modules/routepro/i18n";
import { ui } from "@/styles/ui";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 24,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
};

export default function RouteProModulePage() {
  const t = getRouteProDictionary("it");

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>{t.eyebrow}</p>
      <h1 style={ui.page.title}>{t.title}</h1>
      <p style={ui.page.subtitle}>{t.subtitle}</p>

      <div style={actionsStyle}>
        <Link href="/app/routepro/new" style={ui.button.primary}>
          {t.ctaPrimary}
        </Link>

        <Link href="/app/routepro/settings" style={ui.button.secondary}>
          {t.ctaSecondary}
        </Link>
      </div>

      <div style={{ ...ui.card.base, marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>{t.statusTitle}</h2>
        <p style={mutedTextStyle}>{t.statusBody}</p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={ui.page.sectionTitle}>{t.featuresTitle}</h2>

        <div style={gridStyle}>
          <article style={ui.card.base}>
            <h3>{t.featureImportTitle}</h3>
            <p style={mutedTextStyle}>{t.featureImportBody}</p>
          </article>

          <article style={ui.card.base}>
            <h3>{t.featureReviewTitle}</h3>
            <p style={mutedTextStyle}>{t.featureReviewBody}</p>
          </article>

          <article style={ui.card.base}>
            <h3>{t.featureOptimizeTitle}</h3>
            <p style={mutedTextStyle}>{t.featureOptimizeBody}</p>
          </article>

          <article style={ui.card.base}>
            <h3>{t.featureExecutionTitle}</h3>
            <p style={mutedTextStyle}>{t.featureExecutionBody}</p>
          </article>
        </div>
      </div>

      <div style={{ ...ui.card.base, marginTop: 28 }}>
        <p style={mutedTextStyle}>{t.comingSoon}</p>
      </div>
    </section>
  );
}