import { resolve } from "node:path";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/client.ts", "src/schemas.ts"],
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    dts: {
      generator: "tsgo",
    },
    // Consumers (apps/api via tsx, apps/website via Vite) resolve this package
    // through `exports`, so a watch rebuild must never leave `dist/` missing
    // even briefly. Cleaning here would race every dev server start.
    clean: false,
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov", "html"],
      reportsDirectory: resolve(import.meta.dirname, "coverage"),
      include: ["src/**/*.ts"],
      exclude: [
        // Pure type module — no runtime code to cover.
        "src/services.ts",
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
