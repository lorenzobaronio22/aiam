import { createApiClient } from "api-contract/client";

/**
 * The API origin. Empty (the default) means same-origin, which is what the
 * Vite dev proxy and a same-domain production deploy both need.
 */
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

/**
 * Fully typed RPC client. `AppType` is inferred from the zod schemas in
 * `api-contract`, so paths, query params, bodies, and responses are checked at
 * compile time.
 */
export const api = createApiClient(apiBaseUrl);

/**
 * Typed read used by the landing page status line. The query is validated by
 * the same `ListUsersQuerySchema` the server enforces.
 */
export async function fetchUserCount(): Promise<number | null> {
  try {
    const res = await api.api.v1.users.$get({ query: { limit: "1" } });
    if (!res.ok) return null;
    const body = await res.json();
    return body.total;
  } catch {
    return null;
  }
}
