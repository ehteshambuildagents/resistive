import type { Metadata } from "next";
import "./globals.css";
import "./motion.css";
export const metadata: Metadata = {
  title: "Resistive — Know what to test next.",
  description:
    "A Creative R&D Engine for performance brands. Learn from what has been tested, decide what deserves testing next, and let every experiment compound.",
  applicationName: "Resistive",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Resistive — Know what to test next.",
    description:
      "More creative is becoming easy. The hard part is knowing what is worth testing.",
    type: "website",
    siteName: "Resistive",
  },
  twitter: {
    card: "summary",
    title: "Resistive — Know what to test next.",
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
