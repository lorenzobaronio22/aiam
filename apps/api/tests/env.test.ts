import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { loadEnvFile, parseEnv } from "../src/env.ts";

test("applies development defaults when nothing is configured", () => {
  expect(parseEnv({})).toEqual({
    NODE_ENV: "development",
    PORT: 8787,
    CORS_ORIGINS: [],
    MCP_ALLOWED_HOSTS: ["localhost", "127.0.0.1", "[::1]"],
  });
});

test("coerces PORT and splits comma-separated lists", () => {
  const env = parseEnv({
    PORT: "9000",
    CORS_ORIGINS: "https://a.test, https://b.test ,",
    MCP_ALLOWED_HOSTS: "host.test",
  });

  expect(env.PORT).toBe(9000);
  expect(env.CORS_ORIGINS).toEqual(["https://a.test", "https://b.test"]);
  expect(env.MCP_ALLOWED_HOSTS).toEqual(["host.test"]);
});

test("fails fast with a readable message on invalid configuration", () => {
  expect(() => parseEnv({ NODE_ENV: "nope" })).toThrow(/Invalid environment configuration/);
  expect(() => parseEnv({ PORT: "0" })).toThrow(/PORT/);
});

test("loads a .env file when present and does nothing when it is missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "aiam-env-"));
  const key = "AIAM_ENV_FILE_TEST";
  delete process.env[key];

  try {
    loadEnvFile(dir); // no file yet — no-op
    expect(process.env[key]).toBeUndefined();

    writeFileSync(join(dir, ".env"), `${key}=loaded\n`);
    loadEnvFile(dir);
    expect(process.env[key]).toBe("loaded");
  } finally {
    delete process.env[key];
    rmSync(dir, { recursive: true, force: true });
  }
});
