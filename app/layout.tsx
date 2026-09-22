import type { Metadata } from "next";
import "./systematic.css";
export const metadata: Metadata = {
  title: "Resistive — Your ads should build memory.",
  description:
    "You can spend a million testing ads and still start the next round guessing. Resistive turns creative experiments into lasting knowledge.",
  applicationName: "Resistive",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Resistive — Your ads should build memory.",
    description:
      "Every test should make the next one smarter. Build a creative system that learns.",
    type: "website",
    siteName: "Resistive",
  },
  twitter: {
    card: "summary",
    title: "Resistive — Your ads should build memory.",
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
