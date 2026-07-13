import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Build « artifact » : produit un bundle 100 % autonome (aucune requête
 * réseau) destiné à être incorporé dans une page HTML unique — utilisé
 * pour publier une démo hébergée de l'interface.
 *  - toutes les images sont incorporées en data-URI (assetsInlineLimit)
 *  - les imports dynamiques sont fusionnés dans un seul bundle
 *  - pas de PWA (aucun service worker dans la démo)
 * Usage : npx vite build --config vite.artifact.config.ts
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-artifact",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
