# AIAM — Member Directory

A Vite+ monorepo implementing a member directory: a Hono API, a React +
shadcn/ui frontend, and a shared, type-safe API contract.

## Layout

| Path                    | What it is                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- |
| `apps/website`          | Frontend (Vite + React + Tailwind + shadcn/ui). Uses the typed RPC client.      |
| `apps/api`              | Hono server on Node (`@hono/node-server`). Owns env config, service impls, MCP. |
| `packages/api-contract` | Shared source of truth: zod schemas, Hono routes, `AppType`, typed client.      |

## The `Member` entity

A member is a person with generic attributes:

| Field         | Type     | Notes                             |
| ------------- | -------- | --------------------------------- |
| `id`          | uuid     | Server-generated.                 |
| `firstName`   | string   | Required, ≤ 100 chars.            |
| `lastName`    | string   | Required, ≤ 100 chars.            |
| `email`       | string   | Required, valid email, unique.    |
| `dateOfBirth` | date     | `YYYY-MM-DD`, no time component.  |
| `phoneNumber` | string?  | Optional.                         |
| `address`     | string?  | Optional.                         |
| `notes`       | string?  | Optional.                         |
| `createdAt`   | datetime | Server-generated.                 |
| `updatedAt`   | datetime | Server-generated on every change. |

CRUD lives under `/api/v1/members`: paginated list with `search`, create, get,
patch, and delete. The in-memory `MembersService` in `apps/api` enforces email
uniqueness; swapping it for a database is a change to that one file.

## MCP server

`apps/api` also serves a Model Context Protocol endpoint at `/mcp` (Streamable
HTTP, JSON responses). It exposes the same operations as tools — `list_members`,
`get_member`, `create_member`, `update_member`, and `delete_member` — each
validated with the shared zod schemas and backed by the same `MembersService`
as the REST routes, so rules like email uniqueness hold on both transports.

The endpoint checks the `Host` header against `MCP_ALLOWED_HOSTS`
(defaults to the loopback names) to blunt DNS-rebinding attacks.

## Type safety

`api-contract` is the single source of truth for the API surface:

```
zod schema ──► z.infer ──► request/response DTOs
   │
   ├─► validate()            ──► runtime validation (shared error envelope)
   ├─► Hono chained routes   ──► AppType = typeof routes
   │                                 │
   │                  hono/client hc<AppType> ──► typed client in the frontend
   └─► schemas ──► shared form validation in the browser
```

Because the route tree lives in the contract package, the frontend never
imports anything from `apps/api`. A path, query, body, or response that drifts
is a compile error in `vp check`, not a 400 at runtime.

Three entry points:

- `api-contract` — full surface (schemas, `createApp`, `validate`, errors).
  Server-side.
- `api-contract/client` — `createApiClient` only, which pulls in just
  `hono/client`. **Frontends should import this for requests** so the Hono
  middleware never reaches the browser bundle.
- `api-contract/schemas` — zod schemas and inferred types only. The frontend
  reuses these for form validation, so the rules in the UI are the same rules
  the API enforces.

## Development

```bash
vp run dev
```

`vp run dev` builds the contract once, then runs the contract watcher, the API,
and the frontend together. The frontend proxies `/api` to the API on
`http://localhost:8787`, so no CORS setup is needed locally.

Other commands:

```bash
vp run ready        # build -> check (fmt/lint/types) -> test, across all packages
vp run -r test      # tests
vp run -r build     # build every package in dependency order
vp check            # format, lint, type check
```

Notes on the contract package: its `dist` is what consumers resolve through
`exports`, so it is built before dev starts and `pack.clean` is disabled — a
watch rebuild must never leave `dist` missing, or a running dev server would
fail to import it.

## Testing

Three layers, all runnable from the root:

| Command                | What it runs                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| `vp run test`          | Unit tests for `apps/api`, `apps/website`, and `packages/api-contract`.  |
| `vp run test:coverage` | Unit tests with coverage and the minimum-coverage guardrail (see below). |
| `vp run test:e2e`      | The Gherkin scenarios, as Playwright end-to-end tests.                   |
| `vp run test:all`      | Coverage and e2e together.                                               |

Coverage is enforced per package in each `vite.config.ts`
(`test.coverage.thresholds`): a run fails when statements/branches/functions/
lines drop below the floor. Reports (`text`, `html`, `lcov`, `json-summary`) are
written to `coverage/`.

Behaviour is documented as Cucumber/Gherkin and executed, not just described.
The feature files in [`docs/testing/features`](docs/testing/features) are the
single source of truth; `apps/e2e` compiles them into Playwright tests. See
[`docs/testing/README.md`](docs/testing/README.md) for the full strategy, the
coverage policy, and how to add a scenario.

```bash
vp run ready            # build -> vp check -> coverage (the full gate)
vp run coverage:summary # aggregate coverage table across all packages
```

## Docker

One production image, following the
[Vite+ Docker guide](https://viteplus.dev/guide/docker#production-ssr-node-js-server-app):
the Hono server serves the REST API, the MCP endpoint, **and** the built SPA
(`apps/website`) as static files on a single origin. That removes the second
container, the nginx proxy, and any CORS setup.

The build is multi-stage: the official `ghcr.io/voidzero-dev/vite-plus`
toolchain image compiles both apps, and the runtime stage ships only the
resolved Node.js, the server bundle, production dependencies, and the static
frontend. Because this is a pnpm workspace, the build **context is the repo
root** and `.dockerignore` keeps the context small.

```bash
docker build -f apps/api/Dockerfile -t aiam .
docker run --rm -p 8787:8787 aiam
# then open http://localhost:8787
```

### Local stack

```bash
docker compose up --build
```

- App (SPA + API + MCP): <http://localhost:8787> — `/health`, `/api/*`, and
  `/mcp` live on the same origin as the SPA.

Stop and clean up:

```bash
docker compose down        # add -v to drop any named volumes
```

### Notes

- **Static serving** is enabled by `STATIC_ROOT` (empty by default, so
  `vp run dev` is unaffected — there Vite serves the frontend). The image sets
  it to `./public`. Client-side routes fall back to `index.html`, but `/api/*`
  and `/mcp/*` are never shadowed: an unmatched path there returns the API's
  JSON 404. Hashed assets are cached `immutable`; the shell is `no-cache`.
- **Toolchain version** is pinned via the `VITE_PLUS_IMAGE` build arg
  (default `ghcr.io/voidzero-dev/vite-plus:1.3.0`). Override it to a digest
  for byte-for-byte reproducible builds.
- **Production dependencies** are isolated with `pnpm deploy --prod` in the
  build stage, which inlines the workspace `api-contract` package and drops
  devDependencies (including the `vite-plus` toolchain and the frontend build
  stack) from the runtime.
- **Runtime configuration** is read from the environment, never baked in:
  `NODE_ENV`, `PORT`, `STATIC_ROOT`, `CORS_ORIGINS`, `MCP_ALLOWED_HOSTS` (see
  `apps/api/.env.example`). `.env` is excluded from the build context.
- **Frontend API origin** defaults to same-origin, which this single image
  provides. To point the SPA at a different API, build with
  `--build-arg VITE_API_URL=https://api.example.com` and set `CORS_ORIGINS` on
  the server to that origin.
