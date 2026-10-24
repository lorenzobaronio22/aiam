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
  test: {
    environment: "jsdom",
    setupFiles: [resolve(import.meta.dirname, "src/test/setup.ts")],
    // Restore spies/mocks between tests so one test cannot leak into the next.
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov", "html"],
      reportsDirectory: resolve(import.meta.dirname, "coverage"),
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Entry point: only mounts React, never imported by tests.
        "src/main.tsx",
        // Ambient types, no runtime.
        "src/**/*.d.ts",
        // shadcn registry output — generated, not ours to test.
        "src/components/ui/**",
        // Test-only utilities.
        "src/test/**",
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
