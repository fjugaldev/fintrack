import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinTrack — Finanzas personales",
    short_name: "FinTrack",
    description: "Gestiona tus finanzas personales con FinTrack",
    start_url: "/",
    display: "standalone",
    background_color: "#111110",
    theme_color: "#c07b3a",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-72.png",           sizes: "72x72",   type: "image/png" },
      { src: "/icons/icon-96.png",           sizes: "96x96",   type: "image/png" },
      { src: "/icons/icon-128.png",          sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-192.png",          sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-384.png",          sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512.png",          sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
