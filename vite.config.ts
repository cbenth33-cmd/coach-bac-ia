import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GITHUB_PAGES=true est défini par le workflow CI pour servir depuis /coach-bac-ia/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_PAGES === "true" ? "/coach-bac-ia/" : "/",
});
