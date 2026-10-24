import { createApiClient } from "api-contract/client";

/**
 * The API origin. Empty (the default) means same-origin, which is what the
 * Vite dev proxy and a same-domain production deploy both need.
 */
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

/**
 * Fully typed RPC client. `AppType` is inferred from the zod schemas in
 * `api-contract`, so paths, query params, bodies, and responses are checked at
 * compile time — a drift is a build error, not a 404.
 */
export const api = createApiClient(apiBaseUrl);
