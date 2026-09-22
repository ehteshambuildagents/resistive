import type { Metadata } from "next";
import "./systematic.css";
export const metadata: Metadata = {
  title: "Resistive — Your creative should compound.",
  description:
    "Your ad budget is already buying data. Resistive learns from every creative, decides what deserves testing next, and turns those bets into finished ads.",
  applicationName: "Resistive",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Resistive — Your creative should compound.",
    description:
      "Every test should make the next one smarter. Build a creative system that learns.",
    type: "website",
    siteName: "Resistive",
  },
  twitter: {
    card: "summary",
    title: "Resistive — Your creative should compound.",
    description: "Creative R&D for performance brands.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preload"
          href="/fonts/Geist-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
