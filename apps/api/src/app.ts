import type { ApiServices } from "api-contract";
import { createApp } from "api-contract";
import { env } from "./env.ts";
import { mcpRoutes } from "./mcp.ts";
import { createServices } from "./services/index.ts";
import { mountSpa } from "./static.ts";

/**
 * The running application. Route shape and response types come from
 * `api-contract`; this module only supplies the concrete services, the MCP
 * endpoint, the CORS policy from validated environment config, and — when
 * `STATIC_ROOT` is set — the built SPA, so one process serves everything.
 */
export function buildApp(services: ApiServices = createServices()) {
  const app = createApp(services, {
    corsOrigins: env.CORS_ORIGINS,
    requestLogger: env.NODE_ENV !== "test",
  }).route("/mcp", mcpRoutes);

  // In production the same process serves the SPA; in development `STATIC_ROOT`
  // is empty and Vite serves it instead.
  return env.STATIC_ROOT ? mountSpa(app, { root: env.STATIC_ROOT }) : app;
}

export const app = buildApp();
