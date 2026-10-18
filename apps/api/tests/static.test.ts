import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, expect, test } from "vite-plus/test";
import { createApp } from "api-contract";
import { createInMemoryMembersService } from "../src/services/members.ts";
import { mountSpa } from "../src/static.ts";

/** A throwaway build whose filenames mimic Vite's content hashes. */
const root = mkdtempSync(join(tmpdir(), "aiam-spa-"));
mkdirSync(join(root, "assets"));
writeFileSync(join(root, "index.html"), '<!doctype html><div id="root"></div>');
writeFileSync(join(root, "assets", "app-abc123.js"), "console.log('app')");

afterAll(() => rmSync(root, { recursive: true, force: true }));

const SHELL = '<div id="root">';

const app = mountSpa(
  createApp({ members: createInMemoryMembersService() }, { requestLogger: false }),
  { root },
);

test("client-side routes fall back to the SPA shell", async () => {
  const res = await app.request("/members/42");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/html");
  await expect(res.text()).resolves.toContain(SHELL);
});

test("the site root serves the shell", async () => {
  const res = await app.request("/");
  expect(res.status).toBe(200);
  await expect(res.text()).resolves.toContain(SHELL);
});

test("the shell is revalidated, not cached long", async () => {
  const res = await app.request("/members");
  expect(res.headers.get("cache-control")).toBe("no-cache");
});

test("hashed assets are cached immutably", async () => {
  const res = await app.request("/assets/app-abc123.js");
  expect(res.status).toBe(200);
  expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  expect(res.headers.get("content-type")).toContain("javascript");
  await expect(res.text()).resolves.toContain("console.log");
});

test("a missing hashed asset is a 404 and is not cached", async () => {
  const res = await app.request("/assets/gone-000.js");
  expect(res.status).toBe(404);
  expect(res.headers.get("cache-control")).toBe("no-store");
});

test("unknown API paths return the API 404, never the shell", async () => {
  for (const [method, path] of [
    ["GET", "/api"],
    ["GET", "/api/"],
    ["GET", "/api/nope"],
    ["GET", "/api/v1/nope"],
    ["POST", "/api/nope"],
  ] as const) {
    const res = await app.request(path, { method });
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    await expect(res.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });
  }
});

test("unknown MCP paths return 404, never the shell", async () => {
  const res = await app.request("/mcp/nope");
  expect(res.status).toBe(404);
  expect(res.headers.get("content-type")).toContain("application/json");
});

test("the API still answers beneath the shell", async () => {
  const res = await app.request("/api/v1/members");
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ items: [] });
});

test("non-GET requests never receive the shell", async () => {
  const res = await app.request("/members", { method: "POST" });
  expect(res.status).toBe(404);
});

test("security headers apply to static responses", async () => {
  const res = await app.request("/members");
  expect(res.headers.get("x-content-type-options")).toBe("nosniff");
});
