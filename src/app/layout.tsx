import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: ["400"],
  style: ["italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
  title: {
    default: "AI Dev Reference",
    template: "%s · AI Dev Reference",
  },
  description:
    "Searchable commands, skills, agents, and hooks for Claude, Cursor, and GitHub Copilot. Community-maintained reference.",
  openGraph: {
    title: "AI Dev Reference",
    description:
      "Searchable commands, skills, agents, and hooks for Claude, Cursor, and GitHub Copilot.",
    type: "website",
    siteName: "AI Dev Reference",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Dev Reference",
    description:
      "Searchable commands, skills, agents, and hooks for Claude, Cursor, and GitHub Copilot.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
