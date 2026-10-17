import { defineConfig } from "vite-plus";

/**
 * Same-origin API in development: the frontend calls `/api/...` and Vite
 * proxies it to the API server, so no CORS setup is needed locally.
 */
const API_TARGET = "http://localhost:8787";

export default defineConfig({
  server: {
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
});
