import type { ApiServices } from "api-contract";
import { createApp } from "api-contract";
import { env } from "./env.ts";
import { mcpRoutes } from "./mcp.ts";
import { createServices } from "./services/index.ts";

/**
 * The running application. Route shape and response types come from
 * `api-contract`; this module only supplies the concrete services, the MCP
 * endpoint, and the CORS policy from validated environment config.
 */
export function buildApp(services: ApiServices = createServices()) {
  const app = createApp(services, {
    corsOrigins: env.CORS_ORIGINS,
    requestLogger: env.NODE_ENV !== "test",
  });
  return app.route("/mcp", mcpRoutes);
}

export const app = buildApp();
