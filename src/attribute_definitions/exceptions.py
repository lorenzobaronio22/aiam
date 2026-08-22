from fastapi import status

from src.exceptions import ProblemError


class AttributeDefinitionNotFound(ProblemError):
    def __init__(self, definition_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Attribute definition with id '{definition_id}' not found.",
        )


class DuplicateDefinitionLabel(ProblemError):
    def __init__(self, label: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"An active attribute definition with label '{label}' already exists.",
        )


class UnknownAttributeType(ProblemError):
    def __init__(self, key: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            title="Validation Error",
            detail=f"Attribute type '{key}' does not exist.",
        )
