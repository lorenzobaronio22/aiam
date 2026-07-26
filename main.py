import asyncio
import json
import uuid
from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI(title="Members API")


DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "members.json"
_lock = asyncio.Lock()


def problem(status_code: int, title: str, detail: str, **extras) -> JSONResponse:
    body = {
        "type": f"https://httpstatuses.org/{status_code}",
        "title": title,
        "status": status_code,
        "detail": detail,
        **extras,
    }
    return JSONResponse(content=body, status_code=status_code, media_type="application/problem+json")


class ProblemError(Exception):
    def __init__(self, status_code: int, title: str, detail: str, **extras):
        self.status_code = status_code
        self.title = title
        self.detail = detail
        self.extras = extras


@app.exception_handler(ProblemError)
async def problem_error_handler(request: Request, exc: ProblemError):
    return problem(exc.status_code, exc.title, exc.detail, **exc.extras)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return problem(exc.status_code, exc.detail or "HTTP Error", str(exc.detail or ""))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return problem(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "Validation Error",
        "Request validation failed.",
        errors=exc.errors(),
    )


class MemberIn(BaseModel):
    name: str
    email: EmailStr


class MemberOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: str
    updated_at: str


class MemberUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


def _load_sync() -> dict[str, dict]:
    if not DATA_FILE.exists():
        return {}
    try:
        return json.loads(DATA_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _save_sync(data: dict[str, dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = DATA_FILE.with_name(f"{DATA_FILE.name}.tmp")
    tmp_file.write_text(json.dumps(data, indent=2, default=str))
    tmp_file.replace(DATA_FILE)


async def _load() -> dict[str, dict]:
    async with _lock:
        return await asyncio.to_thread(_load_sync)


async def _save(data: dict[str, dict]) -> None:
    async with _lock:
        await asyncio.to_thread(_save_sync, data)


def _to_out(record: dict) -> MemberOut:
    return MemberOut(
        id=record["id"],
        name=record["name"],
        email=record["email"],
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _email_exists(data: dict[str, dict], email: str, exclude_id: str | None = None) -> bool:
    return any(
        r["email"] == email and r["id"] != exclude_id
        for r in data.values()
    )


@app.get("/")
async def healthcheck():
    return {"status": "ok", "service": app.title, "version": app.version}


@app.get("/members", response_model=list[MemberOut])
async def list_members():
    data = await _load()
    return [_to_out(r) for r in data.values()]


@app.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def create_member(body: MemberIn):
    data = await _load()
    if _email_exists(data, body.email):
        raise ProblemError(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"A member with email '{body.email}' already exists.",
        )
    member_id = str(uuid.uuid4())
    now = _now()
    record = {
        "id": member_id,
        "name": body.name,
        "email": body.email,
        "created_at": now,
        "updated_at": now,
    }
    data[member_id] = record
    await _save(data)
    return _to_out(record)


@app.get("/members/{member_id}", response_model=MemberOut)
async def get_member(member_id: str):
    data = await _load()
    record = data.get(member_id)
    if record is None:
        raise ProblemError(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )
    return _to_out(record)


@app.put("/members/{member_id}", response_model=MemberOut)
async def update_member(member_id: str, body: MemberUpdate):
    data = await _load()
    if member_id not in data:
        raise ProblemError(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )
    if body.email is not None and _email_exists(data, str(body.email), exclude_id=member_id):
        raise ProblemError(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"A member with email '{body.email}' already exists.",
        )
    if body.name is not None:
        data[member_id]["name"] = body.name
    if body.email is not None:
        data[member_id]["email"] = body.email
    data[member_id]["updated_at"] = _now()
    await _save(data)
    return _to_out(data[member_id])


@app.patch("/members/{member_id}", response_model=MemberOut)
async def patch_member(member_id: str, body: MemberUpdate):
    data = await _load()
    if member_id not in data:
        raise ProblemError(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )
    record = data[member_id]
    if body.email is not None:
        if _email_exists(data, body.email, exclude_id=member_id):
            raise ProblemError(
                status_code=status.HTTP_409_CONFLICT,
                title="Conflict",
                detail=f"A member with email '{body.email}' already exists.",
            )
        record["email"] = body.email
    if body.name is not None:
        record["name"] = body.name
    record["updated_at"] = _now()
    await _save(data)
    return _to_out(record)


@app.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(member_id: str):
    data = await _load()
    if member_id not in data:
        raise ProblemError(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )
    del data[member_id]
    await _save(data)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
