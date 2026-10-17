import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { healthRoutes } from "./routes/health.ts";
import { userRoutes } from "./routes/users.ts";
import type { ErrorBody, ErrorCode } from "./schemas/common.ts";
import type { ApiEnv, ApiServices } from "./services.ts";

export interface CreateAppOptions {
  /** Origins allowed to call the API cross-origin. Pass `["*"]` to allow any. */
  corsOrigins?: string[];
  /** Request logging is off in tests to keep output readable. */
  requestLogger?: boolean;
}

const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
  400: "BAD_REQUEST",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE",
};

const notFoundBody: ErrorBody = {
  error: { code: "NOT_FOUND", message: "Not found" },
};

/**
 * Build the API. Route definitions live here — not in `apps/api` — so the
 * exact route tree is captured in `AppType` and shared with the frontend.
 */
export function createApp(services: ApiServices, options: CreateAppOptions = {}) {
  const { corsOrigins = [], requestLogger = true } = options;
  const allowedOrigins = new Set(corsOrigins);

  const app = new Hono<ApiEnv>()
    .use("*", requestId())
    .use("*", secureHeaders())
    .use(
      "*",
      cors({
        origin: (origin) =>
          allowedOrigins.has("*") ? "*" : allowedOrigins.has(origin) ? origin : undefined,
      }),
    );

  if (requestLogger) {
    app.use("*", logger());
  }

  return app
    .use("*", async (c, next) => {
      c.set("services", services);
      await next();
    })
    .notFound((c) => c.json(notFoundBody, 404))
    .onError((error, c) => {
      if (error instanceof HTTPException) {
        const body: ErrorBody = {
          error: {
            code: STATUS_TO_CODE[error.status] ?? "INTERNAL_ERROR",
            message: error.message || "Request failed",
          },
        };
        return c.json(body, error.status);
      }

      console.error(error);
      const body: ErrorBody = {
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      };
      return c.json(body, 500);
    })
    .route("/health", healthRoutes)
    .route("/api/v1/users", userRoutes);
}

/**
 * The complete API surface. Import this type into the frontend (`hono/client`
 * turns it into a fully typed RPC client) — never re-declare the shapes.
 */
export type AppType = ReturnType<typeof createApp>;
