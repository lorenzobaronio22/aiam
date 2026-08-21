from src.attribute_types.schemas import AttributeTypeOut

# Code-defined catalog of attribute types that can be attached to a member.
# Adding a new type means adding an entry here, not changing the API contract.
ATTRIBUTE_TYPE_REGISTRY: list[AttributeTypeOut] = [
    AttributeTypeOut(
        key="free_text_note",
        name="Free Text Note",
        description=(
            "A short freeform note you can attach to a member for general remarks "
            "or context. Accepts any text up to 1000 characters, and can be left "
            "blank."
        ),
    ),
]


def list_attribute_types() -> list[AttributeTypeOut]:
    return list(ATTRIBUTE_TYPE_REGISTRY)
