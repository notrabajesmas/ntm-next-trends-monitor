import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ntm.app";
  const currentDate = new Date().toISOString();

  // Main pages
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Tab-based routes (for deep linking)
  const tabRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/?tab=scanner`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=auditor`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=trends`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=reports`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // API documentation pages
  const apiDocs: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/api/scan-businesses`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/audit-digital`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/analyze-trends`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/generate-report`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/export/pdf`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/export/excel`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/v1/scanner`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/api/v1/auditor`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/api/v1/trends`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Static assets
  const staticAssets: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/manifest.json`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/icon-192x192.png`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${baseUrl}/icon-512x512.png`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];

  return [...mainPages, ...tabRoutes, ...apiDocs, ...staticAssets];
}
