import { resolve } from "node:path";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    platform: "node",
    target: "node22",
    dts: false,
  },
  test: {
    alias: {
      // Run tests against the contract's source so `vp test` does not need a
      // prior `vp pack` in packages/api-contract.
      "api-contract": resolve(import.meta.dirname, "../../packages/api-contract/src/index.ts"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov", "html"],
      reportsDirectory: resolve(import.meta.dirname, "coverage"),
      include: ["src/**/*.ts"],
      exclude: [
        // Process entry point: starts a listener, never imported by tests.
        "src/index.ts",
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
