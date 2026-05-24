import { ndwTokens } from "@/styles/ndw/ndw-tokens";

type NdwPageShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function NdwPageShell({
  children,
  title,
  description,
}: NdwPageShellProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: ndwTokens.colors.background,
        color: ndwTokens.colors.textPrimary,
        padding: ndwTokens.spacing["2xl"],
      }}
    >
      <div
        style={{
          maxWidth: ndwTokens.layout.pageMaxWidth,
          margin: "0 auto",
        }}
      >
        {(title || description) && (
          <header
            style={{
              marginBottom: ndwTokens.spacing["2xl"],
            }}
          >
            {title && (
              <h1
                style={{
                  margin: 0,
                  fontSize: ndwTokens.typography.sizes.pageTitle,
                  fontWeight: ndwTokens.typography.weights.black,
                  lineHeight: ndwTokens.typography.lineHeights.tight,
                  color: ndwTokens.colors.textPrimary,
                }}
              >
                {title}
              </h1>
            )}

            {description && (
              <p
                style={{
                  margin: "10px 0 0",
                  maxWidth: 760,
                  color: ndwTokens.colors.textSecondary,
                  fontSize: ndwTokens.typography.sizes.bodyLarge,
                  lineHeight: ndwTokens.typography.lineHeights.normal,
                }}
              >
                {description}
              </p>
            )}
          </header>
        )}

        {children}
      </div>
    </main>
  );
}