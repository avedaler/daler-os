import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Production is hosted at the root on Vercel. GitHub Pages can still set
// DEPLOY_BASE=/daler-os/ explicitly when building its subpath deployment.
export default defineConfig(({ command }) => ({
  base: command === "build" ? (process.env.DEPLOY_BASE || "/") : "/",
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
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"],
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
