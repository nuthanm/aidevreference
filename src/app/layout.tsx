import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
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
  title: "AI Developer Tools Reference",
  description: "Searchable command, skills, subagent, and hooks reference for Claude, Cursor, and Copilot.",
  openGraph: {
    title: "AI Developer Tools Reference",
    description:
      "Searchable command, skills, subagent, and hooks reference for Claude, Cursor, and Copilot.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Developer Tools Reference",
    description:
      "Searchable command, skills, subagent, and hooks reference for Claude, Cursor, and Copilot.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
