# FastAPI Best Practices Guide

This repository uses FastAPI for the members API. Keep changes aligned with these rules.

## Version Baseline

Assume these versions or newer:

- Python 3.14
- FastAPI 0.115
- Pydantic 2.7
- pydantic-settings 2.4
- SQLAlchemy 2.0
- Alembic 1.13
- httpx 0.27
- PyJWT 2.9
- ruff 0.6

## Project Structure

Organize by domain, not by file type. Keep one package per bounded context.

```text
src/
├── {domain}/
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   ├── service.py
│   ├── dependencies.py
│   ├── config.py
│   ├── constants.py
│   ├── exceptions.py
│   └── utils.py
├── config.py
├── models.py
├── exceptions.py
├── database.py
└── main.py
```

Use explicit imports across domains. Avoid wildcard imports and deep package coupling.

## Routes and Async Boundaries

| Route behavior | Preferred shape |
|---|---|
| Non-blocking I/O | `async def` |
| Blocking I/O with no async client | `def` |
| Mixed blocking and async work | `async def` + `run_in_threadpool` for the blocking part |
| CPU-heavy work | Worker process, not the request handler |

Do not put sync calls like `time.sleep`, `open`, sync HTTP clients, or sync DB drivers inside `async def` handlers.

## Pydantic and Settings

- Use Pydantic v2 patterns.
- Prefer built-in field constraints like `Field(min_length=...)` and `Field(ge=...)`.
- Do not use deprecated `json_encoders`; prefer `@field_serializer` or a serializer annotation.
- Split `BaseSettings` by domain instead of using one global settings class for everything.

## Dependencies

- Use `Annotated[T, Depends(...)]` instead of default-argument `Depends(...)`.
- Put validation in the dependency itself when the dependency loads data.
- Chain dependencies for reusable checks like ownership or authorization.
- Remember that dependencies are cached per request.

## Auth and Database

- Use PyJWT, not `python-jose`.
- Use SQLAlchemy 2.0 async APIs (`AsyncSession`, `async_sessionmaker`, `create_async_engine`).
- Keep naming consistent: lower snake case, singular tables, and shared FK names where possible.
- Prefer SQL-first shaping and aggregation; hydrate into Pydantic only for response validation.

## Testing

- Use `httpx.AsyncClient` with `ASGITransport` for in-process tests.
- Override dependencies with `app.dependency_overrides` instead of monkeypatching internals.
- Prefer real integration coverage for database behavior when practical.

## Migrations and Linting

- Keep Alembic migrations static and reversible.
- Use the async Alembic template.
- Use Ruff for both checking and formatting.

## Common Mistakes to Avoid

- Blocking the event loop with sync I/O inside async handlers.
- Using deprecated Pydantic v1 serialization APIs.
- Using `from jose import jwt`.
- Using `async_asgi_testclient`.
- Returning a Pydantic model and also setting the same class as `response_model` unless that is intentional.
- Mocking the database in integration tests when a real DB is feasible.
- Catching broad `Exception` around route bodies.

## Quick Checks Before Editing

- Is this a route, dependency, schema, service, test, or migration change?
- Is the async boundary correct?
- Are the imports domain-local and explicit?
- Does the test use the supported async client pattern?
- Did the change keep the repo conventions consistent?
