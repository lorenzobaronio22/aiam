# AIAM

Members API.

The project includes a Vue 3 SPA in `frontend/`.
In production builds, FastAPI serves the built frontend from `/app`.

## Guidelines

FastApi guidelines comes from this project: https://github.com/zhanymkanov/fastapi-best-practices

## Requirements

- Defined by `pyproject.toml`

## Run

Start the app in dev mode:

```bash
uv run fastapi dev
```

## Storage

Member records are stored in `data/members.json`. The API will create the file if it does not exist.

## Tests

Install the test extra and run pytest:

```bash
uv sync --extra test
uv run pytest

## Frontend

Install and build the frontend:

```bash
cd frontend
npm install
npm run build
```

After build, run the API and open `/app`.
Client-side paths under `/app/*` are resolved with SPA fallback to `index.html`.
```

## Lint and Format

```bash
uv run ruff check --fix
uv run ruff format
```
