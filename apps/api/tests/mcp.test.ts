import { expect, test } from "vite-plus/test";
import type { ApiServices } from "api-contract";
import { buildApp } from "../src/app.ts";
import { createInMemoryMembersService } from "../src/services/members.ts";

const SEEDED_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

/** A fresh app per test so the shared in-memory store never leaks between them. */
function createTestApp() {
  return buildApp({
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
}

interface ToolCallResult {
  content?: { type: string; text: string }[];
  isError?: boolean;
}

interface JsonRpcBody {
  result?: { tools?: { name: string }[] } & ToolCallResult;
  error?: { code: number; message: string };
}

async function mcp(app: ReturnType<typeof createTestApp>, body: unknown) {
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : {}) as JsonRpcBody };
}

function callTool(name: string, args: unknown) {
  return { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } };
}

/** Reads the JSON payload a successful tool call returned as text content. */
function payload(body: JsonRpcBody): Record<string, unknown> {
  const text = body.result?.content?.[0]?.text;
  if (!text) throw new Error("tool call returned no text content");
  return JSON.parse(text) as Record<string, unknown>;
}

test("POST /mcp lists the member tools", async () => {
  const { status, body } = await mcp(createTestApp(), {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
  });
  expect(status).toBe(200);
  expect(body.result?.tools?.map((tool) => tool.name)).toEqual(
    expect.arrayContaining([
      "list_members",
      "get_member",
      "create_member",
      "update_member",
      "delete_member",
    ]),
  );
});

test("tools/call list_members reads through the service", async () => {
  const { body } = await mcp(createTestApp(), callTool("list_members", {}));
  expect(body.result?.isError).toBeFalsy();
  expect(payload(body)).toMatchObject({ total: 1, items: [{ email: "ada@example.com" }] });
});

test("tools/call create_member then get_member round-trips", async () => {
  const app = createTestApp();
  const created = await mcp(
    app,
    callTool("create_member", {
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      dateOfBirth: "1906-12-09",
    }),
  );
  const member = payload(created.body);
  expect(member).toMatchObject({ email: "grace@example.com" });

  const fetched = await mcp(app, callTool("get_member", { id: member.id }));
  expect(payload(fetched.body)).toMatchObject({ id: member.id });
});

test("tools/call surfaces a domain error as a bounded tool error", async () => {
  const { status, body } = await mcp(
    createTestApp(),
    callTool("create_member", {
      firstName: "Ada",
      lastName: "Again",
      email: "ada@example.com",
      dateOfBirth: "1815-12-10",
    }),
  );
  expect(status).toBe(200);
  expect(body.result?.isError).toBe(true);
  expect(body.result?.content?.[0]?.text).toMatch(/email/i);
});

test("tools/call rejects invalid input without touching the service", async () => {
  const { body } = await mcp(createTestApp(), callTool("get_member", { id: "not-a-uuid" }));
  expect(body.result?.isError).toBe(true);
});

test("tools/call update_member patches only the provided fields", async () => {
  const app = createTestApp();
  const { body } = await mcp(app, callTool("update_member", { id: SEEDED_ID, lastName: "King" }));

  expect(body.result?.isError).toBeFalsy();
  expect(payload(body)).toMatchObject({ id: SEEDED_ID, firstName: "Ada", lastName: "King" });
});

test("tools/call delete_member removes the member", async () => {
  const app = createTestApp();
  const removed = await mcp(app, callTool("delete_member", { id: SEEDED_ID }));
  expect(removed.body.result?.isError).toBeFalsy();

  const after = await mcp(app, callTool("get_member", { id: SEEDED_ID }));
  expect(after.body.result?.isError).toBe(true);
});

test("an unexpected service failure is not swallowed by the tool boundary", async () => {
  const failing: ApiServices = {
    members: {
      list: async () => ({ items: [], page: 1, limit: 20, total: 0 }),
      get: async () => {
        throw new Error("boom");
      },
      create: async () => {
        throw new Error("boom");
      },
      update: async () => {
        throw new Error("boom");
      },
      delete: async () => {
        throw new Error("boom");
      },
    },
  };

  const { body } = await mcp(buildApp(failing), callTool("get_member", { id: SEEDED_ID }));
  expect(body.result?.isError).toBe(true);
  expect(body.result?.content?.[0]?.text).toBe("boom");
});

test("POST /mcp rejects a disallowed Host header", async () => {
  const res = await createTestApp().request("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", host: "evil.example.com" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  expect(res.status).toBe(403);
});

test("POST /mcp allows an IPv6 loopback Host header", async () => {
  const res = await createTestApp().request("/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      host: "[::1]:8787",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  expect(res.status).toBe(200);
});
