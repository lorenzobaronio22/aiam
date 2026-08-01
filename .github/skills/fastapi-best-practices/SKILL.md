---
name: fastapi-best-practices
description: 'Use for this FastAPI repo when working on routes, dependencies, schemas, Pydantic models, SQLAlchemy async, JWT auth, tests, migrations, or linting. Keywords: FastAPI, Pydantic v2, SQLAlchemy 2.0, httpx ASGITransport, PyJWT, pytest, ruff, Alembic.'
---

# FastAPI Best Practices

Use this skill when you are changing or reviewing code in this repo's FastAPI application.

## When to Use
- API routes, dependencies, and request validation
- Pydantic schemas and settings
- SQLAlchemy async data access
- JWT authentication helpers
- httpx test setup and dependency overrides
- Alembic migrations and repository-level linting
- Frontend apps served through FastAPI, including static build output and client-side routing

## What to Do
1. Follow the repo conventions in [the full guide](./references/guide.md).
2. Prefer async FastAPI, Pydantic v2, SQLAlchemy 2.0 async, and PyJWT.
3. Keep blocking work out of async routes; use threadpool handoff only when needed.
4. Use `httpx.AsyncClient` with `ASGITransport` for tests.
5. Keep changes domain-focused and avoid cross-package coupling.

## References
- [FastAPI guide](./references/guide.md)
