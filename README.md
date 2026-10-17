# Vite+ Monorepo Starter

A Vite+ monorepo with a frontend app, a Hono API, and a shared, type-safe API
contract.

## Layout

| Path                    | What it is                                                                    |
| ----------------------- | ----------------------------------------------------------------------------- |
| `apps/website`          | Frontend (Vite). Consumes the API through a typed RPC client.                 |
| `apps/api`              | Hono server on Node (`@hono/node-server`). Owns env config and service impls. |
| `packages/api-contract` | Shared source of truth: zod schemas, Hono routes, `AppType`, typed client.    |
| `packages/utils`        | Example shared library.                                                       |

## Type safety

`api-contract` is the single source of truth for the API surface:

```
zod schema ──► z.infer ──► request/response DTOs
   │
   ├─► validate()        ──► runtime validation (shared error envelope)
   └─► Hono chained routes ──► AppType = typeof routes
                                    │
                       hono/client hc<AppType> ──► typed client in the frontend
```

Because the route tree lives in the contract package, the frontend never imports
anything from `apps/api`. A path, query, body, or response that drifts is a
compile error in `vp check`, not a 400 at runtime.

Two entry points:

- `api-contract` — full surface (schemas, `createApp`, `validate`). Server-side.
- `api-contract/client` — `createApiClient` only, which pulls in just
  `hono/client`. **Frontends should import from here** so zod and the Hono
  middleware never reach the browser bundle.

## Development

`vp run dev` builds the contract once, then runs the contract watcher, the API,
and the frontend together. The frontend proxies `/api` to the API on
`http://localhost:8787`.

```bash
vp run dev
```

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
