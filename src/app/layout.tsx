import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NDW Core | Nota Digital Works",
    template: "%s | NDW Core",
  },
  description:
    "NDW Core is the operational workspace for Nota Digital Works: a modular SaaS ecosystem for workflows, tools, and execution.",
  applicationName: "NDW Core",
  icons: {
    icon: "/brand/ndw/icon/ndw-mark.png",
    shortcut: "/brand/ndw/icon/ndw-mark.png",
    apple: "/brand/ndw/icon/ndw-mark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}