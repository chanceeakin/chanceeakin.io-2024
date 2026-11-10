import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chance Eakin",
    short_name: "Chance",
    description: "Chance Eakin's personal site: writing, projects and playground experiments.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#4f5d2a",
    theme_color: "#4f5d2a",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
