from pydantic import EmailStr

from src.models import ApiModel


class MemberIn(ApiModel):
    name: str
    email: EmailStr


class MemberOut(ApiModel):
    id: str
    name: str
    email: str
    created_at: str
    updated_at: str


class MemberUpdate(ApiModel):
    name: str | None = None
    email: EmailStr | None = None
