from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pathlib import Path

from src.exceptions import (
    ProblemError,
    http_exception_handler,
    problem_error_handler,
    validation_exception_handler,
)
from src.members.router import router as members_router

app = FastAPI(
    title="Members API",
)

app.add_exception_handler(ProblemError, problem_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.get("/health")
async def healthcheck():
    return {"status": "ok", "service": app.title, "version": app.version}


app.include_router(members_router)

FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"


@app.get("/app", include_in_schema=False)
async def frontend_entrypoint() -> FileResponse:
    return FileResponse(FRONTEND_INDEX)


@app.get("/app/{full_path:path}", include_in_schema=False)
async def frontend_files_and_fallback(full_path: str) -> FileResponse:
    requested_path = FRONTEND_DIST_DIR / full_path

    if requested_path.is_file():
        return FileResponse(requested_path)

    return FileResponse(FRONTEND_INDEX)
