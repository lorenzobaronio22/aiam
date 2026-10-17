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
  },
});
