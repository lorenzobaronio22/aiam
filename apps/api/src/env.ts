import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

// Load `.env` when present (dev and `node dist/index.mjs` both benefit).
// Test runs and CI, which have no file, simply fall through to real env vars.
const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

/** Splits a comma-separated list, dropping blanks and surrounding whitespace. */
const commaSeparated = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  CORS_ORIGINS: z.string().default("").transform(commaSeparated),
  /**
   * Hostnames allowed in the `Host` header of MCP requests (port-agnostic).
   * Defaults to the loopback names, which is what a local/dev deployment needs.
   */
  MCP_ALLOWED_HOSTS: z.string().default("localhost,127.0.0.1,[::1]").transform(commaSeparated),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

/** Validated, typed environment. Fail fast at boot instead of mid-request. */
export const env: Env = parsed.data;
