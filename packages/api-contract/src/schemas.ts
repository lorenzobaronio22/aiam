/**
 * Browser-safe entry point (`api-contract/schemas`).
 *
 * The frontend reuses these zod schemas for form validation, so unlike the
 * package root this module must never reach into Hono, routes, or middleware.
 * It pulls in zod alone; the RPC client stays in `api-contract/client`.
 */
export * from "./schemas/index.ts";
