## Plan: Add Vue SPA at /app

Add a minimal Vue 3 single-page app scaffold (Vite + TypeScript) in `frontend/`, serve its built assets from FastAPI under `/app` with SPA fallback for client-side routes, and extend container build to compile frontend assets and copy only production artifacts into the final image. Update Docker ignore rules to reduce build context and final image bloat, and add integration tests validating `/app` serving behavior.

**Steps**
1. Phase 1 - Frontend scaffold (independent)
   - Create a minimal Vue 3 + Vite + TypeScript app in `frontend/` with `Hello World` UI.
   - Ensure build output is configured to produce static assets suitable for mounting at `/app` (base path and asset URLs aligned with subpath hosting).
   - Keep starter intentionally small (single page, no router required yet unless needed for fallback validation).
2. Phase 2 - FastAPI static mount for SPA (depends on step 1 output assumptions)
   - Update `src/main.py` to mount built frontend assets at `/app` using FastAPI/Starlette frontend-static serving support.
   - Configure SPA fallback to `index.html` for unknown client-side paths under `/app/*`.
   - Preserve existing API route precedence and ensure `/health` and `/members*` behavior remains unchanged.
3. Phase 3 - Docker multi-stage build integration (depends on steps 1-2)
   - Extend `Dockerfile` with a Node build stage that installs frontend deps deterministically and runs the frontend production build.
   - Copy only built frontend artifacts into the Python runtime image path expected by FastAPI mount.
   - Preserve existing optimized Python builder/final-stage strategy and non-root runtime user.
4. Phase 4 - Docker context optimization (parallel with step 3 edits)
   - Update `.dockerignore` to exclude frontend dev-only artifacts (for example dependency caches and local build outputs) while keeping required manifest/source files available for the frontend build stage.
   - Validate that ignore rules do not accidentally exclude files needed during Docker build.
5. Phase 5 - Integration coverage (depends on step 2)
   - Add app-level integration tests in `tests/test_main.py` using existing async `client` fixture and `@pytest.mark.anyio` pattern.
   - Verify `/app` returns `200` and HTML content.
   - Verify SPA fallback route under `/app/<client-route>` also resolves to frontend HTML.
6. Phase 6 - Verification and docs (depends on all prior steps)
   - Run tests with `uv run pytest`.
   - Build image with `docker build` and smoke-test `/app` endpoint from container runtime.
   - Update README run/build notes briefly to include frontend build/serve behavior if needed.

**Relevant files**
- `/Users/lorenzobaronio/GitHub/aiam/src/main.py` - add frontend static mount at `/app` with SPA fallback behavior.
- `/Users/lorenzobaronio/GitHub/aiam/Dockerfile` - add frontend build stage and artifact copy into final runtime image.
- `/Users/lorenzobaronio/GitHub/aiam/.dockerignore` - refine ignore patterns for lightweight context and image.
- `/Users/lorenzobaronio/GitHub/aiam/tests/test_main.py` - add integration tests for `/app` and fallback route behavior.
- `/Users/lorenzobaronio/GitHub/aiam/pyproject.toml` - verify no backend dependency changes are required for static serving approach.
- `/Users/lorenzobaronio/GitHub/aiam/README.md` - document frontend serving entrypoint and relevant dev/build commands (if required).

**Verification**
1. Local tests:
   - `uv sync --extra test`
   - `uv run pytest`
2. Frontend build sanity:
   - Run frontend build command and verify output directory contains `index.html` plus hashed assets.
3. Container validation:
   - `docker build -t aiam:spa .`
   - Run container and request `/health`, `/app`, and `/app/some-client-route`.
   - Confirm `/app` and fallback route return HTML, while API endpoints still return JSON.
4. Regression checks:
   - Confirm members API integration tests continue to pass unchanged.

**Decisions**
- Frontend source location: `frontend/` at repository root.
- Frontend stack: Vue 3 + Vite + TypeScript using Composition API conventions.
- SPA behavior: enable fallback so `/app/*` deep links resolve to frontend `index.html`.
- Scope included: starter Hello World page, backend mount at `/app`, Docker build + ignore updates, integration test coverage for route serving.
- Scope excluded: advanced frontend routing/state management/auth, production CDN setup, reverse proxy customization.

**Further Considerations**
1. Frontend package manager lockfile policy: prefer npm lockfile committed for reproducible Docker builds.
2. Optional follow-up: add a dev workflow command to run FastAPI and Vite concurrently for local frontend iteration.
3. Optional follow-up: add cache headers/static compression strategy once frontend grows beyond starter size.