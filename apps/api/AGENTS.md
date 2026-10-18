# AGENTS.md — Hono API app (`apps/api`)

## Stack

- Hono (Web-standard Request/Response) running on Node via `@hono/node-server`
- zod for all validation and schemas (use the single zod version already installed; never mix v3 and v4 schemas)
- `@hono/zod-validator` for request validation
- Official MCP TypeScript SDK for the MCP server, mounted on the same Hono app
- Vitest (via `vp test`) for tests
- Toolchain is Vite+: use `vp`, never call tsc/eslint/prettier/vitest directly

## Commands

- Dev server: `vp run dev` (a package script, not the built-in `vp dev`, which starts the Vite web dev server)
- Type check + lint + format: `vp check` (use `vp check --fix` to autofix)
- Tests: `vp test`
- Before declaring any task done: run `vp check` and `vp test` and fix every failure

## Before writing Hono or MCP code

Hono and the MCP SDK change quickly and the MCP SDK is between major versions. Do not rely on memory.
Look up current docs first (hono.dev and the official MCP TypeScript SDK repo),
and check the installed versions in package.json before using an API.

## Core rules

1. **No controller classes.** Write handlers inline in the route chain. Classes and detached handler
   functions lose Hono's path-parameter and validation type inference.
2. **Chain route definitions** on a single instance so types flow to the RPC client:
   ```ts
   const users = new Hono()
     .get("/", (c) => c.json(listUsers()))
     .post("/", zValidator("json", createUserSchema), async (c) => {
       const input = c.req.valid("json");
       return c.json(await createUser(input), 201);
     });
   export default users;
   ```
   Separate `app.get(...)` / `app.post(...)` statements on the same variable break type inference for the client.
3. **Compose with `app.route()`** and export the type from the chained result:
   ```ts
   const routes = new Hono().route("/users", users).route("/posts", posts);
   export type AppType = typeof routes;
   ```
   Register sub-routes before mounting them. `apps/web` imports `AppType` and uses `hc<AppType>` from `hono/client`.
4. **Keep handlers thin.** A handler validates input, calls a service function, and shapes the response.
   Business logic and data access live in `services/` with no Hono imports so REST routes and MCP tools share it.
5. **Validate every input with zod.** Use `zValidator('json' | 'query' | 'param' | 'header', schema)` and read data with
   `c.req.valid(...)`. Never call `c.req.json()` or read raw params on an unvalidated route.
6. **Schemas are shared.** Request/response schemas used by both API and web go in `packages/api-contract`.
   Infer types with `z.infer`; do not hand-write duplicate interfaces.

## Typing app context

- Declare bindings and per-request variables once and pass them as generics:
  ```ts
  type AppEnv = { Variables: { requestId: string; userId?: string } };
  const app = new Hono<AppEnv>();
  ```
- Use `c.set()` / `c.get()` for per-request data. No module-level mutable state for request data.
- Use `createFactory` from `hono/factory` when middleware or handlers are defined outside the chain and need typed context.

## Errors

- Throw `HTTPException` (from `hono/http-exception`) for expected HTTP errors; throw plain errors for unexpected ones.
- Define one global `app.onError` that returns a consistent JSON error shape (code, message, request id) and never leaks
  stack traces or internals. Define `app.notFound` to return the same shape.
- Services throw domain errors; map them to HTTP status codes in `onError`, not inside services.

## Middleware

- Register global middleware before routes, in this order: request id, logger, secure headers, CORS (only for `/api/*`
  and with an explicit origin allow-list), body-size limit, auth (only where needed).
- Do not use `origin: '*'` with credentials. Do not disable security middleware to make a test pass.
- Prefer built-in `hono/*` middleware before writing or adding a new one.

## Configuration and secrets

- Read environment variables only in `env.ts`, validated with zod at startup. Fail fast with a clear message.
- Import the validated config everywhere else. Never read `process.env` in handlers or services.
- Never log or return secrets, tokens, or full request bodies.

## MCP server

- Mount the MCP endpoint (Streamable HTTP) on the same app at `/mcp`. Use the official SDK's Hono integration if the
  installed SDK version provides one; otherwise use the community `@hono/mcp` bridge. Verify against the installed version.
- Define each tool with a zod input schema and a clear description. A tool handler calls the same `services/` function as
  the REST route; do not duplicate logic.
- Tool output must be bounded and safe: validate inputs, cap list sizes, and return actionable errors instead of throwing raw ones.
- Apply the same authentication and authorization to MCP as to REST. Validate `Origin`/`Host` headers as the SDK recommends.
- Do not add stdio transport unless asked; this app is a hosted HTTP service.

## Testing

- Prefer `app.request('/path', init)` for fast route tests with no network, or `testClient(app)` from `hono/testing`
  for typed calls.
- Test services directly as plain functions; test routes for status codes, validation failures (400), auth failures, and the error shape.
- Test MCP tools through the service layer, plus one end-to-end test that the `/mcp` endpoint lists tools.
- Never rely on a real network or real third-party API in tests. Mock at the service boundary.
- Every new route needs at least a happy-path test and a validation-failure test.

## Don'ts

- Don't create controller classes or decorators.
- Don't write routes as unchained `app.get(...)` statements that you intend to expose through RPC.
- Don't parse bodies manually or cast request data with `as`.
- Don't put business logic, database calls, or env reads in route handlers.
- Don't catch an error just to swallow it; let `onError` handle it.
- Don't use Node-only APIs in shared code unless the deployment target is confirmed Node-only.
- Don't add dependencies without checking they are needed, maintained, and compatible with the installed Hono and zod versions.
- Don't edit generated files or lockfiles by hand.

## Done checklist

- [ ] Inputs validated with zod; types inferred, no `any` or unchecked casts
- [ ] Route chained and included in the exported `AppType`
- [ ] Business logic in `services/`, reused by MCP if relevant
- [ ] Errors go through `HTTPException` / `onError` with the standard shape
- [ ] Tests added or updated
- [ ] `vp check` and `vp test` pass
