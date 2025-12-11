import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: "GuessSG",
    description: seoConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#dc2626",
    lang: seoConfig.locale,
    categories: ["games", "education"],
    icons: [
      {
        src: "/orchids-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/orchids-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Play GuessSG",
        url: "/",
        description: "Start a new Singapore word guessing round",
      },
    ],
    prefer_related_applications: false,
  };
}

