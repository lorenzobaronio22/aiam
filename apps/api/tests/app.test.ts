import { expect, test } from "vite-plus/test";
import { hc } from "hono/client";
import { ErrorBodySchema, type AppType, createApp } from "api-contract";
import { buildApp } from "../src/app.ts";
import { createInMemoryUsersService } from "../src/services/users.ts";

const app = buildApp({
  users: createInMemoryUsersService([
    {
      id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
      email: "ada@example.com",
      name: "Ada Lovelace",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
});

/** Same wiring as the frontend, resolved in-process. */
const client = hc<AppType>("http://localhost", {
  fetch: app.request.bind(app),
});

test("GET /health reports ok", async () => {
  const res = await client.health.$get();
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ status: "ok" });
});

test("GET /api/v1/users reads through the service", async () => {
  const res = await client.api.v1.users.$get({ query: { limit: "1" } });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({
    total: 1,
    limit: 1,
    items: [{ email: "ada@example.com" }],
  });
});

test("POST /api/v1/users then GET it back", async () => {
  const created = await client.api.v1.users.$post({
    json: { email: "grace@example.com", name: "Grace Hopper" },
  });
  if (created.status !== 201) throw new Error(`unexpected status ${created.status}`);
  const body = await created.json();

  const fetched = await client.api.v1.users[":id"].$get({
    param: { id: body.user.id },
  });
  expect(fetched.status).toBe(200);
  await expect(fetched.json()).resolves.toMatchObject({
    user: { email: "grace@example.com" },
  });
});

test("validation failures use the shared error envelope", async () => {
  const res = await client.api.v1.users.$post({ json: { email: "x", name: "" } });
  expect(res.status).toBe(400);
  expect(ErrorBodySchema.safeParse(await res.json()).success).toBe(true);
});

test("CORS is closed by default for unknown origins", async () => {
  const res = await app.request("/health", {
    headers: { origin: "https://evil.example.com" },
  });
  expect(res.headers.get("access-control-allow-origin")).toBeNull();
});

test("CORS echoes a configured origin", async () => {
  const allowed = createApp(
    { users: createInMemoryUsersService() },
    { corsOrigins: ["https://aiam.example.com"], requestLogger: false },
  );
  const res = await allowed.request("/health", {
    headers: { origin: "https://aiam.example.com" },
  });
  expect(res.headers.get("access-control-allow-origin")).toBe("https://aiam.example.com");
});
