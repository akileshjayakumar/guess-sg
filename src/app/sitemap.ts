import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${seoConfig.siteUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

