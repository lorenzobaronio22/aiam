import { expect, test } from "vite-plus/test";
import { hc } from "hono/client";
import { type AppType, ErrorBodySchema, createApp } from "../src/index.ts";
import type { User } from "../src/schemas/users.ts";
import type { ApiServices } from "../src/services.ts";

const VALID_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const MISSING_ID = "00000000-0000-4000-8000-000000000000";
const CREATED_AT = "2026-01-01T00:00:00.000Z";

function createTestServices(): ApiServices {
  const users: User[] = [
    { id: VALID_ID, email: "ada@example.com", name: "Ada Lovelace", createdAt: CREATED_AT },
  ];

  return {
    users: {
      async list({ page, limit }) {
        const start = (page - 1) * limit;
        return {
          items: users.slice(start, start + limit),
          page,
          limit,
          total: users.length,
        };
      },
      async get(id) {
        return users.find((user) => user.id === id) ?? null;
      },
      async create(input) {
        const user: User = { ...input, id: VALID_ID, createdAt: CREATED_AT };
        users.push(user);
        return user;
      },
      async update(id, input) {
        const index = users.findIndex((user) => user.id === id);
        if (index === -1) return null;
        const updated: User = { ...users[index], ...input };
        users[index] = updated;
        return updated;
      },
    },
  };
}

const app = createApp(createTestServices(), { requestLogger: false });

/**
 * The same client the frontend uses, wired to the app in-process. If a route,
 * query, or body type drifts, this file stops compiling.
 */
const client = hc<AppType>("http://localhost", {
  fetch: app.request.bind(app),
});

test("GET /health", async () => {
  const res = await client.health.$get();
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ status: "ok" });
});

test("GET /api/v1/users returns a paginated list", async () => {
  const res = await client.api.v1.users.$get({ query: {} });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({
    total: 1,
    page: 1,
    limit: 20,
    items: [{ id: VALID_ID, name: "Ada Lovelace" }],
  });
});

test("POST /api/v1/users creates a user with 201", async () => {
  const res = await client.api.v1.users.$post({
    json: { email: "grace@example.com", name: "Grace Hopper" },
  });
  expect(res.status).toBe(201);
  await expect(res.json()).resolves.toMatchObject({
    user: { email: "grace@example.com", name: "Grace Hopper" },
  });
});

test("POST /api/v1/users rejects an invalid body with the shared error envelope", async () => {
  const res = await client.api.v1.users.$post({
    json: { email: "not-an-email", name: "" },
  });
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(ErrorBodySchema.safeParse(body).success).toBe(true);
});

test("GET /api/v1/users/:id returns 404 for an unknown id", async () => {
  const res = await client.api.v1.users[":id"].$get({ param: { id: MISSING_ID } });
  expect(res.status).toBe(404);
  await expect(res.json()).resolves.toMatchObject({
    error: { code: "NOT_FOUND" },
  });
});

test("GET /api/v1/users/:id rejects a non-uuid id with 400", async () => {
  const res = await client.api.v1.users[":id"].$get({ param: { id: "not-a-uuid" } });
  expect(res.status).toBe(400);
});

test("PATCH /api/v1/users/:id updates a user", async () => {
  const res = await client.api.v1.users[":id"].$patch({
    param: { id: VALID_ID },
    json: { name: "Ada King" },
  });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ user: { name: "Ada King" } });
});

test("unknown routes use the shared error envelope", async () => {
  const res = await app.request("/nope");
  expect(res.status).toBe(404);
  expect(ErrorBodySchema.safeParse(await res.json()).success).toBe(true);
});
