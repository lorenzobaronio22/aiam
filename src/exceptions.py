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


def _serialize_validation_errors(errors: list[dict]) -> list[dict]:
    """`RequestValidationError.errors()` may embed raw exception instances (e.g.
    under `ctx.error` for a field_validator's `ValueError`), which aren't JSON
    serializable as-is. Stringify them so the response body can be encoded."""
    serialized = []
    for error in errors:
        error = dict(error)
        ctx = error.get("ctx")
        if isinstance(ctx, dict) and isinstance(ctx.get("error"), Exception):
            error["ctx"] = {**ctx, "error": str(ctx["error"])}
        serialized.append(error)
    return serialized


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    return problem(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "Validation Error",
        "Request validation failed.",
        errors=_serialize_validation_errors(exc.errors()),
    )
