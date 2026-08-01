# syntax=docker/dockerfile:1

# ---- builder ------------------------------------------------------------
# Builds the virtual environment in a throwaway stage so build tools,
# the uv cache, and the source tree never end up in the final image.
FROM python:3.14-slim AS builder

# Pull the uv binary from Astral's distroless image instead of installing
# via curl/pip, keeping the builder stage lean and the install reproducible.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0 \
    UV_NO_DEV=1

WORKDIR /app

# Install dependencies only, in their own layer, using bind mounts for the
# lock/metadata files so this layer is cached until uv.lock/pyproject.toml
# actually change (project source code changes do NOT invalidate it).
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-editable

# Now bring in the project source and install the project itself
# (non-editable, so the final image doesn't need the source tree at all).
COPY pyproject.toml uv.lock ./
COPY src ./src
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-editable

# ---- frontend-builder ---------------------------------------------------
FROM node:24-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend ./
RUN npm run build

# ---- final ----------------------------------------------------------------
FROM python:3.14-slim

RUN groupadd --system app \
    && useradd --system --gid app --no-create-home --home-dir /app app

WORKDIR /app

# Only the synced virtual environment is copied over; no compilers, caches,
# or source files from the builder stage make it into the final image.
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --from=frontend-builder --chown=app:app /frontend/dist /app/frontend/dist

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# Runtime data directory for the JSON member store; mount a volume here to
# persist data across container restarts/upgrades.
RUN mkdir -p /app/data && chown app:app /app/data

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request as u; u.urlopen('http://127.0.0.1:8000/health', timeout=2)"]

# Exec form so SIGTERM reaches uvicorn directly for graceful shutdown.
# Single process per container: replication is handled by the orchestrator.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
