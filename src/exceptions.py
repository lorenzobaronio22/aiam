from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ProblemError(Exception):
    def __init__(self, status_code: int, title: str, detail: str, **extras):
        self.status_code = status_code
        self.title = title
        self.detail = detail
        self.extras = extras


def problem(status_code: int, title: str, detail: str, **extras) -> JSONResponse:
    body = {
        "type": f"https://httpstatuses.org/{status_code}",
        "title": title,
        "status": status_code,
        "detail": detail,
        **extras,
    }
    return JSONResponse(
        content=body,
        status_code=status_code,
        media_type="application/problem+json",
    )


async def problem_error_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, ProblemError)
    return problem(exc.status_code, exc.title, exc.detail, **exc.extras)


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)
    return problem(exc.status_code, exc.detail or "HTTP Error", str(exc.detail or ""))


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    return problem(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "Validation Error",
        "Request validation failed.",
        errors=exc.errors(),
    )
