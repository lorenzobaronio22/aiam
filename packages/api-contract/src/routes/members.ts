import { Hono } from "hono";
import { z } from "zod";
import type { ApiEnv } from "../services.ts";
import {
  CreateMemberSchema,
  ListMembersQuerySchema,
  MemberIdSchema,
  UpdateMemberSchema,
} from "../schemas/members.ts";
import { validate } from "../validate.ts";

const MemberParamsSchema = z.object({ id: MemberIdSchema });

/**
 * The member resource. Registered as a single chained expression so Hono keeps
 * the inferred path params, validators, and response types that `AppType`
 * — and therefore the typed client — depends on.
 *
 * Handlers stay thin: validate, call the service, shape the response. The
 * service throws `NotFoundError` / `ConflictError`, which `onError` turns into
 * the shared error envelope.
 */
export const memberRoutes = new Hono<ApiEnv>()
  .get("/", validate("query", ListMembersQuerySchema), async (c) => {
    const result = await c.var.services.members.list(c.req.valid("query"));
    return c.json(result, 200);
  })
  .post("/", validate("json", CreateMemberSchema), async (c) => {
    const member = await c.var.services.members.create(c.req.valid("json"));
    return c.json({ member }, 201);
  })
  .get("/:id", validate("param", MemberParamsSchema), async (c) => {
    const member = await c.var.services.members.get(c.req.valid("param").id);
    return c.json({ member }, 200);
  })
  .patch(
    "/:id",
    validate("param", MemberParamsSchema),
    validate("json", UpdateMemberSchema),
    async (c) => {
      const member = await c.var.services.members.update(
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return c.json({ member }, 200);
    },
  )
  .delete("/:id", validate("param", MemberParamsSchema), async (c) => {
    await c.var.services.members.delete(c.req.valid("param").id);
    return c.body(null, 204);
  });
