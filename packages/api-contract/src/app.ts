import type { Context } from "hono";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { DomainError } from "./errors.ts";
import { healthRoutes } from "./routes/health.ts";
import { memberRoutes } from "./routes/members.ts";
import type { ErrorBody, ErrorCode } from "./schemas/common.ts";
import type { ApiEnv, ApiServices } from "./services.ts";

/** Requests with a body larger than this are rejected before any handler reads it. */
const MAX_BODY_SIZE = 1024 * 1024; // 1 MiB

export interface CreateAppOptions {
  /** Origins allowed to call the API cross-origin. Pass `["*"]` to allow any. */
  corsOrigins?: string[];
  /** Request logging is off in tests to keep output readable. */
  requestLogger?: boolean;
}

/** Maps the shared error code to the HTTP status that carries it. */
const CODE_TO_STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
};

/** Maps an `HTTPException`'s status back to a code; falls back to 500 semantics. */
const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
  400: "BAD_REQUEST",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "UNPROCESSABLE",
};

/** Builds the shared error envelope, always tagged with the request id. */
function errorBody(
  c: Context<ApiEnv>,
  code: ErrorCode,
  message: string,
  details?: unknown[],
): ErrorBody {
  return {
    error: {
      code,
      message,
      requestId: c.get("requestId"),
      ...(details ? { details } : {}),
    },
  };
}

/**
 * Build the API. Route definitions live here — not in `apps/api` — so the
 * exact route tree is captured in `AppType` and shared with the frontend.
 */
export function createApp(services: ApiServices, options: CreateAppOptions = {}) {
  const { corsOrigins = [], requestLogger = true } = options;
  const allowedOrigins = new Set(corsOrigins);

  // Global middleware runs in this order: request id, logger, secure headers,
  // CORS (API only), body-size limit. Auth, when added, goes after these.
  const app = new Hono<ApiEnv>().use("*", requestId());

  if (requestLogger) {
    app.use("*", logger());
  }

  return app
    .use("*", secureHeaders())
    .use(
      "/api/*",
      cors({
        origin: (origin) =>
          allowedOrigins.has("*") ? "*" : allowedOrigins.has(origin) ? origin : undefined,
      }),
    )
    .use(
      "*",
      bodyLimit({
        maxSize: MAX_BODY_SIZE,
        onError: (c) => c.json(errorBody(c, "PAYLOAD_TOO_LARGE", "Request body is too large"), 413),
      }),
    )
    .use("*", async (c, next) => {
      c.set("services", services);
      await next();
    })
    .notFound((c) => c.json(errorBody(c, "NOT_FOUND", "Not found"), 404))
    .onError((error, c) => {
      if (error instanceof DomainError) {
        return c.json(errorBody(c, error.code, error.message), CODE_TO_STATUS[error.code]);
      }

      if (error instanceof HTTPException) {
        return c.json(
          errorBody(
            c,
            STATUS_TO_CODE[error.status] ?? "INTERNAL_ERROR",
            error.message || "Request failed",
          ),
          error.status,
        );
      }

      console.error(error);
      return c.json(errorBody(c, "INTERNAL_ERROR", "Internal server error"), 500);
    })
    .route("/health", healthRoutes)
    .route("/api/v1/members", memberRoutes);
}

/**
 * The complete API surface. Import this type into the frontend (`hono/client`
 * turns it into a fully typed RPC client) — never re-declare the shapes.
 */
export type AppType = ReturnType<typeof createApp>;
