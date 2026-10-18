import { zValidator } from "@hono/zod-validator";
import type { Context, ValidationTargets } from "hono";
import type { z } from "zod";
import type { ErrorBody } from "./schemas/common.ts";

/**
 * `zValidator` with validation failures normalized to the shared error
 * envelope, so the typed client sees the same `error` shape for invalid input
 * as it does for a 404 or a 500.
 *
 * `Target` stays generic on purpose: the literal target (`"query"`, `"json"`,
 * ...) has to reach the middleware's input type, which is what tells the RPC
 * client exactly which argument the route needs and nothing more.
 */
export function validate<Target extends keyof ValidationTargets, S extends z.ZodType>(
  target: Target,
  schema: S,
) {
  return zValidator(target, schema, (result, c: Context) => {
    if (result.success) return;
    const body: ErrorBody = {
      error: {
        code: "BAD_REQUEST",
        message: `Invalid ${target}`,
        requestId: c.get("requestId"),
        details: result.error.issues,
      },
    };
    return c.json(body, 400);
  });
}
