// @lovable.dev/vite-tanstack-config already includes core plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        filename: "sw.js",
        manifest: {
          name: "CarteraApp",
          short_name: "CarteraApp",
          description: "Gestión de cartera de clientes y rutas",
          theme_color: "#2563eb",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/icon-512.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          ],
        },
        workbox: {
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-cache",
                networkTimeoutSeconds: 3,
              },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && ["style", "script", "worker"].includes(request.destination),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "asset-cache" },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && ["image", "font"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "media-cache",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
