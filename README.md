# AIAM

Members API.

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
```

## Lint and Format

```bash
uv run ruff check --fix
uv run ruff format
```
