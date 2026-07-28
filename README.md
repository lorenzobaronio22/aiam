# AIAM

Members API built with FastAPI.

## Guidelines

FastApi guidelines comes from this project: https://github.com/zhanymkanov/fastapi-best-practices

## Requirements

- Python 3.14
- FastAPI runtime dependencies from `pyproject.toml`

## Run

Start the app with Uvicorn:

```bash
uvicorn main:app --reload
```

Or run the canonical src entrypoint:

```bash
uvicorn src.main:app --reload
```

## Architecture

The project uses a domain-oriented `src/` layout:

- `src/main.py`: app composition, exception handlers, docs visibility policy
- `src/exceptions.py`: shared `application/problem+json` envelope and handlers
- `src/config.py`: environment settings
- `src/members/router.py`: API endpoints
- `src/members/dependencies.py`: reusable route dependencies
- `src/members/service.py`: members business logic
- `src/members/schemas.py`: Pydantic request/response schemas
- `src/members/constants.py`: data path constants
- `src/members/utils.py`: JSON store I/O helpers

`main.py` is a compatibility shim that re-exports `app` from `src.main`.

## API

- `GET /` returns a basic health payload.
- `GET /members` lists members.
- `POST /members` creates a member.
- `GET /members/{member_id}` fetches one member.
- `PUT /members/{member_id}` updates a member.
- `PATCH /members/{member_id}` partially updates a member.
- `DELETE /members/{member_id}` removes a member.

## Storage

Member records are stored in `data/members.json`. The API will create the file if it does not exist.

## Tests

Install the test extra and run pytest:

```bash
uv sync --extra test
pytest
```

## Lint and Format

```bash
ruff check --fix .
ruff format .
```
