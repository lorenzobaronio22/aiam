import type { ApiServices } from "api-contract";
import { createApp } from "api-contract";
import { env } from "./env.ts";
import { createServices } from "./services/index.ts";

/**
 * The running application. Route shape and response types come from
 * `api-contract`; this module only supplies the concrete services and the
 * CORS policy from validated environment config.
 */
export function buildApp(services: ApiServices = createServices()) {
  return createApp(services, {
    corsOrigins: env.CORS_ORIGINS,
    requestLogger: env.NODE_ENV !== "test",
  });
}

export const app = buildApp();
