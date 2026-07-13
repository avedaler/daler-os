import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: на GitHub Pages сайт живёт по пути /daler-os/; при переходе на
// собственный домен (GoDaddy) или Vercel задать DEPLOY_BASE=/.
export default defineConfig(({ command }) => ({
  base: command === "build" ? (process.env.DEPLOY_BASE || "/daler-os/") : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "DALER OS",
        short_name: "DALER OS",
        description: "Личная операционная система: ритуал дня, астрослой, CEO-review",
        lang: "ru",
        start_url: "/",
        display: "standalone",
        background_color: "#0C0F14",
        theme_color: "#0C0F14",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  server: { port: 5173, strictPort: true }
}));
