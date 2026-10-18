import { expect, test } from "vite-plus/test";
import { hc } from "hono/client";
import { type AppType, ErrorBodySchema, createApp } from "../src/index.ts";
import { ConflictError, NotFoundError } from "../src/errors.ts";
import type { Member } from "../src/schemas/members.ts";
import type { ApiServices } from "../src/services.ts";

const VALID_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const MISSING_ID = "00000000-0000-4000-8000-000000000000";
const TIMESTAMP = "2026-01-01T00:00:00.000Z";

/**
 * A minimal but faithful `MembersService` for route-level tests: it enforces
 * the same not-found and duplicate-email rules the real service does, without
 * pulling `apps/api` into the contract package.
 */
function createTestServices(): ApiServices {
  const members: Member[] = [
    {
      id: VALID_ID,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      dateOfBirth: "1815-12-10",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ];

  return {
    members: {
      async list({ page, limit, search }) {
        const term = search?.toLowerCase();
        const filtered = term
          ? members.filter((member) =>
              `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase().includes(term),
            )
          : members;
        const start = (page - 1) * limit;
        return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
      },
      async get(id) {
        const member = members.find((candidate) => candidate.id === id);
        if (!member) throw new NotFoundError("Member not found");
        return member;
      },
      async create(input) {
        if (members.some((member) => member.email === input.email)) {
          throw new ConflictError("A member with this email already exists");
        }
        const member: Member = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: TIMESTAMP,
          updatedAt: TIMESTAMP,
        };
        members.push(member);
        return member;
      },
      async update(id, input) {
        const index = members.findIndex((member) => member.id === id);
        const current = members[index];
        if (index === -1 || !current) throw new NotFoundError("Member not found");
        const updated: Member = { ...current, ...input, updatedAt: TIMESTAMP };
        members[index] = updated;
        return updated;
      },
      async delete(id) {
        const index = members.findIndex((member) => member.id === id);
        if (index === -1) throw new NotFoundError("Member not found");
        members.splice(index, 1);
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

test("GET /api/v1/members returns a paginated list", async () => {
  const res = await client.api.v1.members.$get({ query: {} });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({
    total: 1,
    page: 1,
    limit: 20,
    items: [{ id: VALID_ID, firstName: "Ada", lastName: "Lovelace" }],
  });
});

test("GET /api/v1/members filters by search", async () => {
  const hit = await client.api.v1.members.$get({ query: { search: "lovelace" } });
  await expect(hit.json()).resolves.toMatchObject({ total: 1 });

  const miss = await client.api.v1.members.$get({ query: { search: "nobody" } });
  await expect(miss.json()).resolves.toMatchObject({ total: 0, items: [] });
});

test("POST /api/v1/members creates a member with 201", async () => {
  const res = await client.api.v1.members.$post({
    json: {
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      dateOfBirth: "1906-12-09",
    },
  });
  expect(res.status).toBe(201);
  await expect(res.json()).resolves.toMatchObject({
    member: { firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
  });
});

test("POST /api/v1/members rejects an invalid body with the shared error envelope", async () => {
  const res = await client.api.v1.members.$post({
    json: { firstName: "", lastName: "X", email: "not-an-email", dateOfBirth: "nope" },
  });
  expect(res.status).toBe(400);
  const parsed = ErrorBodySchema.safeParse(await res.json());
  if (!parsed.success) throw new Error("expected the shared error envelope");
  expect(parsed.data.error.code).toBe("BAD_REQUEST");
  expect(parsed.data.error.requestId).toEqual(expect.any(String));
});

test("POST /api/v1/members rejects a body larger than the limit with 413", async () => {
  const res = await app.request("/api/v1/members", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: `{"firstName":"${"x".repeat(1024 * 1024)}"}`,
  });
  expect(res.status).toBe(413);
  await expect(res.json()).resolves.toMatchObject({
    error: { code: "PAYLOAD_TOO_LARGE" },
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

test("GET /api/v1/members/:id returns 404 for an unknown id", async () => {
  const res = await client.api.v1.members[":id"].$get({ param: { id: MISSING_ID } });
  expect(res.status).toBe(404);
  await expect(res.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });
});

test("GET /api/v1/members/:id returns the member body", async () => {
  const res = await client.api.v1.members[":id"].$get({ param: { id: VALID_ID } });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({
    member: { id: VALID_ID, email: "ada@example.com" },
  });
});

test("GET /api/v1/members/:id rejects a non-uuid id with 400", async () => {
  const res = await client.api.v1.members[":id"].$get({ param: { id: "not-a-uuid" } });
  expect(res.status).toBe(400);
});

test("PATCH /api/v1/members/:id updates a member", async () => {
  const res = await client.api.v1.members[":id"].$patch({
    param: { id: VALID_ID },
    json: { lastName: "King" },
  });
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ member: { lastName: "King" } });
});

test("DELETE /api/v1/members/:id removes a member", async () => {
  const created = await client.api.v1.members.$post({
    json: {
      firstName: "Temp",
      lastName: "Member",
      email: "temp@example.com",
      dateOfBirth: "1990-01-01",
    },
  });
  if (created.status !== 201) throw new Error(`unexpected status ${created.status}`);
  const { member } = await created.json();

  const removed = await client.api.v1.members[":id"].$delete({ param: { id: member.id } });
  expect(removed.status).toBe(204);

  const after = await client.api.v1.members[":id"].$get({ param: { id: member.id } });
  expect(after.status).toBe(404);
});

test("unknown routes use the shared error envelope", async () => {
  const res = await app.request("/nope");
  expect(res.status).toBe(404);
  expect(ErrorBodySchema.safeParse(await res.json()).success).toBe(true);
});
