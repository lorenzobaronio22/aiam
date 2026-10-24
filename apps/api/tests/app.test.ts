import { expect, test } from "vite-plus/test";
import { hc } from "hono/client";
import { ErrorBodySchema, type AppType, createApp } from "api-contract";
import { buildApp } from "../src/app.ts";
import { createInMemoryMembersService } from "../src/services/members.ts";

const SEEDED_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const app = buildApp({
  members: createInMemoryMembersService([
    {
      id: SEEDED_ID,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      dateOfBirth: "1815-12-10",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
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

test("GET /api/v1/members reads through the service", async () => {
  const res = await client.api.v1.members.$get({ query: { limit: "1" } });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({
    total: 1,
    limit: 1,
    items: [{ email: "ada@example.com" }],
  });
});

test("POST /api/v1/members then GET it back", async () => {
  const created = await client.api.v1.members.$post({
    json: {
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      dateOfBirth: "1906-12-09",
    },
  });
  if (created.status !== 201) throw new Error(`unexpected status ${created.status}`);
  const body = await created.json();

  const fetched = await client.api.v1.members[":id"].$get({
    param: { id: body.member.id },
  });
  expect(fetched.status).toBe(200);
  await expect(fetched.json()).resolves.toMatchObject({
    member: { email: "grace@example.com" },
  });
});

test("POST /api/v1/members rejects a duplicate email with 409", async () => {
  const res = await client.api.v1.members.$post({
    json: {
      firstName: "Ada",
      lastName: "Again",
      email: "ada@example.com",
      dateOfBirth: "1815-12-10",
    },
  });
  expect(res.status).toBe(409);
  await expect(res.json()).resolves.toMatchObject({ error: { code: "CONFLICT" } });
});

test("DELETE /api/v1/members/:id removes the member", async () => {
  const removed = await client.api.v1.members[":id"].$delete({ param: { id: SEEDED_ID } });
  expect(removed.status).toBe(204);

  const after = await client.api.v1.members[":id"].$get({ param: { id: SEEDED_ID } });
  expect(after.status).toBe(404);
});

test("validation failures use the shared error envelope", async () => {
  const res = await client.api.v1.members.$post({
    json: { firstName: "", lastName: "X", email: "x", dateOfBirth: "nope" },
  });
  expect(res.status).toBe(400);
  const parsed = ErrorBodySchema.safeParse(await res.json());
  if (!parsed.success) throw new Error("expected the shared error envelope");
  expect(parsed.data.error.requestId).toEqual(expect.any(String));
});

test("CORS is closed by default for unknown origins", async () => {
  const res = await app.request("/api/v1/members", {
    headers: { origin: "https://evil.example.com" },
  });
  expect(res.headers.get("access-control-allow-origin")).toBeNull();
});

test("CORS echoes a configured origin", async () => {
  const allowed = createApp(
    { members: createInMemoryMembersService() },
    { corsOrigins: ["https://aiam.example.com"], requestLogger: false },
  );
  const res = await allowed.request("/api/v1/members", {
    headers: { origin: "https://aiam.example.com" },
  });
  expect(res.headers.get("access-control-allow-origin")).toBe("https://aiam.example.com");
});
