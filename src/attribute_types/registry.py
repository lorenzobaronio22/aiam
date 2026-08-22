from collections.abc import Callable
from dataclasses import dataclass

from src.attribute_types.schemas import AttributeTypeOut


@dataclass(frozen=True)
class AttributeTypeDefinition:
    key: str
    name: str
    description: str
    validate_value: Callable[[str], None]


def _validate_free_text_note(value: str) -> None:
    if len(value) > 1000:
        raise ValueError("Free Text Note value must be at most 1000 characters.")


# Code-defined catalog of attribute types that can be attached to a member.
# Adding a new type means adding an entry here, not changing the API contract.
ATTRIBUTE_TYPE_REGISTRY: list[AttributeTypeDefinition] = [
    AttributeTypeDefinition(
        key="free_text_note",
        name="Free Text Note",
        description=(
            "A short freeform note you can attach to a member for general remarks "
            "or context. Accepts any text up to 1000 characters, and can be left "
            "blank."
        ),
        validate_value=_validate_free_text_note,
    ),
]

_REGISTRY_BY_KEY = {definition.key: definition for definition in ATTRIBUTE_TYPE_REGISTRY}


def list_attribute_types() -> list[AttributeTypeOut]:
    return [
        AttributeTypeOut(
            key=definition.key, name=definition.name, description=definition.description
        )
        for definition in ATTRIBUTE_TYPE_REGISTRY
    ]


def attribute_type_exists(key: str) -> bool:
    return key in _REGISTRY_BY_KEY


def validate_attribute_value(key: str, value: str) -> None:
    """Raises ValueError if the value violates the attribute type's rule(s)."""
    _REGISTRY_BY_KEY[key].validate_value(value)
