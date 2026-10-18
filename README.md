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
