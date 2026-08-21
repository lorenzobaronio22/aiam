from fastapi import status

from src.exceptions import ProblemError


class MemberNotFound(ProblemError):
    def __init__(self, member_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )


class DuplicateMemberIdentifier(ProblemError):
    def __init__(self, identifier_type: str, value: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"A member with {identifier_type} '{value}' already exists.",
        )


class UnknownAttributeType(ProblemError):
    def __init__(self, key: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            title="Validation Error",
            detail=f"Attribute type '{key}' does not exist.",
        )


class DuplicateAttributeLabel(ProblemError):
    def __init__(self, label: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"An attribute with label '{label}' already exists on this member.",
        )


class InvalidAttributeValue(ProblemError):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            title="Validation Error",
            detail=detail,
        )


class AttributeNotFound(ProblemError):
    def __init__(self, attribute_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Attribute with id '{attribute_id}' not found.",
        )
