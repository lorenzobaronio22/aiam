import { Hono } from "hono";
import { z } from "zod";
import type { ApiEnv } from "../services.ts";
import { validate } from "../validate.ts";
import {
  CreateUserSchema,
  ListUsersQuerySchema,
  UpdateUserSchema,
  UserIdSchema,
} from "../schemas/users.ts";

/**
 * Chained registration matters: splitting these into separate statements (or
 * building them in a loop) erases the inferred route types that `AppType`
 * — and therefore the client — depends on.
 */
export const userRoutes = new Hono<ApiEnv>()
  .get("/", validate("query", ListUsersQuerySchema), async (c) => {
    const list = await c.var.services.users.list(c.req.valid("query"));
    return c.json(list, 200);
  })
  .post("/", validate("json", CreateUserSchema), async (c) => {
    const user = await c.var.services.users.create(c.req.valid("json"));
    return c.json({ user }, 201);
  })
  .get("/:id", validate("param", z.object({ id: UserIdSchema })), async (c) => {
    const user = await c.var.services.users.get(c.req.valid("param").id);
    if (!user) {
      return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
    }
    return c.json({ user }, 200);
  })
  .patch(
    "/:id",
    validate("param", z.object({ id: UserIdSchema })),
    validate("json", UpdateUserSchema),
    async (c) => {
      const user = await c.var.services.users.update(c.req.valid("param").id, c.req.valid("json"));
      if (!user) {
        return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
      }
      return c.json({ user }, 200);
    },
  );
