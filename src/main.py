from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

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

app.frontend("/app", directory="dist")
