import { Hono } from "hono";
import type { ApiEnv } from "../services.ts";
import { HealthSchema } from "../schemas/health.ts";

const startedAt = Date.now();

/**
 * Liveness probe. Deliberately free of Node APIs so the contract stays
 * runnable on any platform; the response is parsed against `HealthSchema` so
 * shape drift surfaces here instead of in a consumer.
 */
export const healthRoutes = new Hono<ApiEnv>().get("/", (c) =>
  c.json(
    HealthSchema.parse({
      status: "ok",
      uptimeMs: Math.max(0, Date.now() - startedAt),
    }),
    200,
  ),
);
