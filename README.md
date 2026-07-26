# AIAM

Members API built with FastAPI.

## Requirements

- Python 3.14
- FastAPI runtime dependencies from `pyproject.toml`

## Run

Start the app with Uvicorn:

```bash
uvicorn main:app --reload
```

Or use the convenience script:

```bash
aiam
```

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
