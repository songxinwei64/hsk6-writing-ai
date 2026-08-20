import type { MetadataRoute } from "next";

const siteUrl = "https://hsk6-writing-ai.vercel.app";

const publicRoutes = [
  "",
  "/practice",
  "/practice/sentence",
  "/practice/paragraph",
  "/membership",
  "/community/discussions",
  "/community/wall",
  "/contact",
  "/privacy",
  "/terms",
  "/refunds",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/practice") ? 0.9 : 0.6,
  }));
}
