from typing import Literal

from pydantic import EmailStr, field_validator

from src.models import ApiModel


class MemberIdentifier(ApiModel):
    type: Literal["tax_id"]
    country: Literal["IT"]
    value: str

    @field_validator("value")
    @classmethod
    def value_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Identifier value must not be blank.")
        return value


def _reject_duplicate_identifier_types(
    identifiers: list[MemberIdentifier],
) -> list[MemberIdentifier]:
    seen_types = {identifier.type for identifier in identifiers}
    if len(seen_types) != len(identifiers):
        raise ValueError("A member can only have one identifier per type.")
    return identifiers


class MemberIn(ApiModel):
    name: str
    email: EmailStr
    identifiers: list[MemberIdentifier] = []

    @field_validator("identifiers")
    @classmethod
    def _validate_identifiers(
        cls, identifiers: list[MemberIdentifier]
    ) -> list[MemberIdentifier]:
        return _reject_duplicate_identifier_types(identifiers)


class MemberAttributeIn(ApiModel):
    key: str
    label: str
    value: str

    @field_validator("label")
    @classmethod
    def _label_must_not_be_blank(cls, label: str) -> str:
        label = label.strip()
        if not label:
            raise ValueError("Attribute label must not be blank.")
        return label


class MemberAttributeUpdate(ApiModel):
    label: str | None = None
    value: str | None = None

    @field_validator("label")
    @classmethod
    def _label_must_not_be_blank(cls, label: str | None) -> str | None:
        if label is None:
            return None
        label = label.strip()
        if not label:
            raise ValueError("Attribute label must not be blank.")
        return label


class MemberAttributeOut(ApiModel):
    id: str
    key: str
    label: str
    value: str


class MemberOut(ApiModel):
    id: str
    name: str
    email: str
    identifiers: list[MemberIdentifier] = []
    attributes: list[MemberAttributeOut] = []
    created_at: str
    updated_at: str


class MemberUpdate(ApiModel):
    name: str | None = None
    email: EmailStr | None = None
    identifiers: list[MemberIdentifier] | None = None

    @field_validator("identifiers")
    @classmethod
    def _validate_identifiers(
        cls, identifiers: list[MemberIdentifier] | None
    ) -> list[MemberIdentifier] | None:
        if identifiers is None:
            return None
        return _reject_duplicate_identifier_types(identifiers)


class MemberEventPayload(ApiModel):
    member_id: str
    member: MemberOut | None = None
