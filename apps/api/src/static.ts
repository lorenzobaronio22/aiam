import { serveStatic } from "@hono/node-server/serve-static";
import type { ApiEnv } from "api-contract";
import type { Hono } from "hono";

/** Vite emits content-hashed filenames, so their bytes never change. */
const IMMUTABLE = "public, max-age=31536000, immutable";
/** The shell must be revalidated so a new deploy is picked up immediately. */
const NO_CACHE = "no-cache";

export interface SpaOptions {
  /** Directory holding the built SPA: `index.html` and `assets/`. */
  root: string;
  /** File served for client-side routes. Defaults to `index.html`. */
  index?: string;
}

/**
 * Serve the built single-page app from this Hono server.
 *
 * This is deliberate about routing order:
 *
 *  1. `/api/*` and `/mcp/*` belong to the server. An unmatched path there is a
 *     real 404 (the shared JSON error envelope), never the SPA shell — so a
 *     typo'd endpoint fails loudly instead of returning `index.html` with 200.
 *  2. Cache policy is set *before* `serveStatic` runs. It snapshots headers when
 *     it builds the streamed response, so a late `onFound` write is dropped.
 *  3. Real files (hashed assets, favicon, ...) are served as-is; a missing
 *     hashed asset is a 404 and is not cached, not the shell.
 *  4. Every remaining `GET` falls back to the shell for client-side routes.
 *     Only `GET` — navigation is always a GET, and other methods keep the API's
 *     404 instead of silently succeeding with HTML.
 *
 * `serveStatic` handles the rest of the hardening: MIME types, `HEAD`, range
 * requests, `Last-Modified`, and rejecting `..`/`\\` path traversal.
 */
export function mountSpa(app: Hono<ApiEnv>, { root, index = "index.html" }: SpaOptions) {
  return app
    .all("/api/*", (c) => c.notFound())
    .all("/mcp/*", (c) => c.notFound())
    .use("*", async (c, next) => {
      c.header("Cache-Control", c.req.path.startsWith("/assets/") ? IMMUTABLE : NO_CACHE);
      await next();
    })
    .use("*", serveStatic({ root }))
    .get("/assets/*", (c) => {
      c.header("Cache-Control", "no-store");
      return c.notFound();
    })
    .get("*", serveStatic({ root, path: index }));
}
