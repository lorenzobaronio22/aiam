import { z } from "zod";

/**
 * Error envelope shared by every non-2xx response.
 *
 * Because the shape lives next to the routes, the typed client can surface a
 * predictable `error` object instead of an untyped string.
 */
export const ErrorBodySchema = z.object({
  error: z.object({
    code: z.enum([
      "BAD_REQUEST",
      "NOT_FOUND",
      "CONFLICT",
      "PAYLOAD_TOO_LARGE",
      "UNPROCESSABLE",
      "INTERNAL_ERROR",
    ]),
    message: z.string(),
    /** Correlates the response with the server logs; echoes the `X-Request-Id` header. */
    requestId: z.string(),
    details: z.array(z.unknown()).optional(),
  }),
});

export type ErrorBody = z.infer<typeof ErrorBodySchema>;

export const ErrorCodeSchema = ErrorBodySchema.shape.error.shape.code;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Output type — `page`/`limit` are always present after coercion. */
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export function listSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
  });
}
