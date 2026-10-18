import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

/**
 * Same-origin API in development: the frontend calls `/api/...` and Vite
 * proxies it to the API server, so no CORS setup is needed locally.
 */
const API_TARGET = "http://localhost:8787";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Keep in sync with the `@/*` path alias in tsconfig.json.
    alias: { "@": resolve(import.meta.dirname, "src") },
  },
  server: {
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
});
