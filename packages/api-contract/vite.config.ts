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
});
