/**
 * Browser-safe entry point (`api-contract/client`).
 *
 * It intentionally imports `AppType` with `import type`, so the emitted
 * `client.mjs` contains only `hono/client` — no zod, no routes, no server
 * middleware. Frontends should import from here, not from the package root.
 */
import { hc } from "hono/client";
import type { ClientRequestOptions } from "hono/client";
import type { AppType } from "./app.ts";

/**
 * Create a typed RPC client. `AppType` carries the whole route tree, so every
 * path, query string, request body, and response body is inferred from the
 * zod schemas — a typo or a missing field is a compile error, not a 400.
 *
 * `options` accepts the same hooks as `hc` (custom `fetch`, default headers,
 * ...), which is what makes the client injectable in tests.
 */
export function createApiClient(baseUrl: string, options?: ClientRequestOptions) {
  return hc<AppType>(baseUrl, options);
}

export type ApiClient = ReturnType<typeof createApiClient>;

export type { ClientRequestOptions, InferRequestType, InferResponseType } from "hono/client";
