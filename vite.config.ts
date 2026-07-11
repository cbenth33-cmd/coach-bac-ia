import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GITHUB_PAGES=true est défini par le workflow CI pour servir depuis /coach-bac-ia/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: { globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"] },
      manifest: {
        name: "Coach Bac IA",
        short_name: "CoachBac",
        description: "Ton coach personnel jusqu'au baccalauréat : points, mentions, plan de révision, chat IA.",
        lang: "fr",
        display: "standalone",
        background_color: "#F6F5F0",
        theme_color: "#232B4A",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  base: process.env.GITHUB_PAGES === "true" ? "/coach-bac-ia/" : "/",
});
