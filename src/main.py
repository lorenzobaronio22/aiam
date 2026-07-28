from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.config import settings
from src.exceptions import (
    ProblemError,
    http_exception_handler,
    problem_error_handler,
    validation_exception_handler,
)
from src.members.router import router as members_router

SHOW_DOCS_IN = {"local", "staging"}

app_kwargs = {"title": "Members API"}
if settings.ENVIRONMENT not in SHOW_DOCS_IN:
    app_kwargs["openapi_url"] = None

app = FastAPI(**app_kwargs)

app.add_exception_handler(ProblemError, problem_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.get("/")
async def healthcheck():
    return {"status": "ok", "service": app.title, "version": app.version}


app.include_router(members_router)
