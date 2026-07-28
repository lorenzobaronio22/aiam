## Plan: Add Basic GitHub Actions CI

Set up a minimal GitHub Actions workflow that runs on pull requests and pushes to `main`, and validates the current codebase by running Ruff lint checks and the pytest suite with `uv`.

**Steps**
1. Define workflow triggers:
- `pull_request` on all branches.
- `push` on `main`.

2. Add one workflow file with a single job:
- File: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Job name: `test-and-lint`
- Runner: `ubuntu-latest`

3. Configure environment in the job:
- Checkout repo.
- Install `uv` via official setup action.
- Install Python `3.14` (aligned with [pyproject.toml](pyproject.toml)).

4. Install dependencies for CI:
- Run `uv sync --all-extras --dev` so pytest + ruff are available.

5. Run checks in CI (non-mutating):
- Lint: `uv run ruff check .`
- Tests: `uv run pytest`

6. Add basic cache support:
- Use setup action caching for Python/uv artifacts to speed up repeated runs.

7. Validate before/after merge:
- Local pre-checks:
1. `uv run ruff check .`
2. `uv run pytest`
- Remote check:
1. Confirm `CI` workflow runs on PR/push and both steps pass.

**Relevant files**
- [.github/workflows/ci.yml](.github/workflows/ci.yml): new CI workflow.
- [pyproject.toml](pyproject.toml): source of Python/tooling requirements used by CI.
- [README.md](README.md): optional follow-up for CI badge/docs.

**Scope decisions**
- Included: lint check + tests only.
- Excluded for now: deploy/release, coverage upload, matrix builds, security scanning, type checks, auto-fix formatting.
- CI lint runs without `--fix` for deterministic behavior.

If you want, I can now implement this exact plan by creating [.github/workflows/ci.yml](.github/workflows/ci.yml).