import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.vercel.app";
  const routes = [
    "",
    "/claude",
    "/cursor",
    "/copilot",
    "/feedback",
    "/privacy-policy",
    "/terms-and-conditions",
    "/release-notes",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
