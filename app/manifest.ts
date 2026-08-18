import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitFlow CRM",
    short_name: "FitFlow",
    description: "Le centre de pilotage CRM pour les studios fitness et les coachs.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#062e29",
    lang: "fr-FR",
    icons: [
      { src: "/icon.svg", sizes: "64x64", type: "image/svg+xml", purpose: "maskable" },
      { src: "/fitflow-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
