## Plan: Restructure Members API to FastAPI Best Practices

Refactor the project from a monolithic [main.py](main.py) into a domain-oriented `src/` package aligned with your FastAPI agent instructions, while preserving current API behavior and tests.

**Steps**
1. Baseline behavior before refactor
1. Run and preserve current behavior expectations from [tests/test_main.py](tests/test_main.py).
1. Capture non-regression contract: route set, status codes, and problem+json error shape.

2. Create new project structure (`src/`) and bootstrap
1. Add [src/main.py](src/main.py) as canonical app entrypoint.
1. Convert [main.py](main.py) into a compatibility shim that re-exports `app` from `src.main`.
1. Add [src/config.py](src/config.py), [src/exceptions.py](src/exceptions.py), and optional shared model base in [src/models.py](src/models.py).

3. Extract `members` bounded context
1. Add [src/members/router.py](src/members/router.py) for endpoints only.
1. Add [src/members/schemas.py](src/members/schemas.py) for Pydantic DTOs (`MemberIn`, `MemberOut`, `MemberUpdate`).
1. Add [src/members/service.py](src/members/service.py) for business logic and orchestration.
1. Add [src/members/dependencies.py](src/members/dependencies.py) for reusable validation deps.
1. Add [src/members/exceptions.py](src/members/exceptions.py), [src/members/constants.py](src/members/constants.py), and [src/members/utils.py](src/members/utils.py) for domain utilities.

4. Modernize dependency and route style
1. Use `Annotated[..., Depends(...)]` for dependency injection where appropriate.
1. Keep filesystem operations off the event loop via threadpool patterns (`to_thread` / equivalent utility).
1. Keep explicit exception mapping, avoid broad catch-all patterns.

5. Compose app and documentation policy
1. In [src/main.py](src/main.py), include members router and global exception handlers.
1. Add environment-based docs toggle (`openapi_url=None` outside approved envs) using [src/config.py](src/config.py).
1. Keep route contracts stable during restructuring.

6. Update and strengthen tests
1. Update tests to target the new structure (prefer `src.main` while preserving shim compatibility).
1. Extend tests for dependency-based not-found and duplicate-email behavior.
1. Keep integration flow coverage from [tests/test_main.py](tests/test_main.py).

7. Update packaging/tooling/docs
1. Update [pyproject.toml](pyproject.toml) for `src`-layout packaging and lint/test setup.
1. Add Ruff workflow (`ruff check --fix`, `ruff format`) consistent with your instructions.
1. Update [README.md](README.md) run/test commands and architecture notes.

8. Explicit out-of-scope (for a follow-up phase)
1. SQLAlchemy async + Alembic migration from JSON storage.
1. JWT/auth domain introduction.
1. Background worker architecture.

**Relevant files**
- [main.py](main.py)
- [pyproject.toml](pyproject.toml)
- [README.md](README.md)
- [tests/test_main.py](tests/test_main.py)
- [tests/conftest.py](tests/conftest.py)
- [src/main.py](src/main.py)
- [src/config.py](src/config.py)
- [src/exceptions.py](src/exceptions.py)
- [src/models.py](src/models.py)
- [src/members/router.py](src/members/router.py)
- [src/members/schemas.py](src/members/schemas.py)
- [src/members/service.py](src/members/service.py)
- [src/members/dependencies.py](src/members/dependencies.py)
- [src/members/exceptions.py](src/members/exceptions.py)
- [src/members/constants.py](src/members/constants.py)
- [src/members/utils.py](src/members/utils.py)

**Verification**
1. `pytest` before/after each major refactor phase.
2. Validate route parity and error envelope parity.
3. Confirm both startup commands work during migration:
1. `uvicorn main:app --reload`
1. `uvicorn src.main:app --reload`
4. Run lint/format:
1. `ruff check --fix .`
1. `ruff format .`
5. Manual docs visibility check by environment.

**Decisions captured**
- Include: structure/domain split, dependency style updates, exception organization, tests/tooling updates.
- Exclude: DB migration, auth, workers.
- Migration strategy: keep [main.py](main.py) compatibility shim initially.

I also saved this plan to session memory at `/memories/session/plan.md` so it is ready for implementation handoff.