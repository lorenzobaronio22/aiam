import { expect, test } from "vite-plus/test";
import { api, apiBaseUrl } from "./api.ts";

test("defaults to a same-origin API base URL", () => {
  // No VITE_API_URL in the test env, so the client posts to the current origin
  // (the Vite dev proxy in development, the same domain in production).
  expect(apiBaseUrl).toBe("");
});

test("exposes a configured RPC client", () => {
  expect(api.api.v1.members.$get).toBeTypeOf("function");
  expect(api.health.$get).toBeTypeOf("function");
});
