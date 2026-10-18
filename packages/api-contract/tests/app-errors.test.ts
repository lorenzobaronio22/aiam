import { expect, test, vi } from "vite-plus/test";
import { HTTPException } from "hono/http-exception";
import { createApp } from "../src/index.ts";
import type { ApiServices } from "../src/services.ts";

/** A service container with one operation overridden to fail on demand. */
function createFailingServices(overrides: Partial<ApiServices["members"]>): ApiServices {
  return {
    members: {
      list: async () => ({ items: [], page: 1, limit: 20, total: 0 }),
      get: async () => {
        throw new Error("unused");
      },
      create: async () => {
        throw new Error("unused");
      },
      update: async () => {
        throw new Error("unused");
      },
      delete: async () => {},
      ...overrides,
    },
  };
}

test("request logging is on by default and off in tests", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  const res = await createApp(createFailingServices({})).request("/health");

  expect(res.status).toBe(200);
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});

test("an HTTPException is mapped to the shared envelope and its status", async () => {
  const app = createApp(
    createFailingServices({
      list: async () => {
        throw new HTTPException(422, { message: "Cannot list" });
      },
    }),
    { requestLogger: false },
  );

  const res = await app.request("/api/v1/members");

  expect(res.status).toBe(422);
  await expect(res.json()).resolves.toMatchObject({
    error: { code: "UNPROCESSABLE", message: "Cannot list" },
  });
});

test("an HTTPException with an unmapped status falls back to INTERNAL_ERROR", async () => {
  const app = createApp(
    createFailingServices({
      list: async () => {
        throw new HTTPException(401);
      },
    }),
    { requestLogger: false },
  );

  const res = await app.request("/api/v1/members");

  expect(res.status).toBe(401);
  await expect(res.json()).resolves.toMatchObject({
    error: { code: "INTERNAL_ERROR", message: "Request failed" },
  });
});

test("an unexpected error becomes a 500 without leaking details", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const app = createApp(
    createFailingServices({
      list: async () => {
        throw new Error("kaboom");
      },
    }),
    { requestLogger: false },
  );

  const res = await app.request("/api/v1/members");

  expect(res.status).toBe(500);
  const body = await res.text();
  expect(JSON.parse(body)).toMatchObject({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
  expect(body).not.toContain("kaboom");
  error.mockRestore();
});

test("a wildcard CORS configuration allows any origin", async () => {
  const app = createApp(createFailingServices({}), {
    corsOrigins: ["*"],
    requestLogger: false,
  });

  const res = await app.request("/api/v1/members", {
    headers: { origin: "https://anywhere.example" },
  });

  expect(res.headers.get("access-control-allow-origin")).toBe("*");
});
