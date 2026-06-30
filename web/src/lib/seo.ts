import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.vercel.app";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "AI Developer Tools Reference",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
