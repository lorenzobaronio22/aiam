from typing import Literal

from pydantic import field_validator

from src.models import ApiModel


def _label_must_not_be_blank(label: str) -> str:
    label = label.strip()
    if not label:
        raise ValueError("Attribute definition label must not be blank.")
    return label


class AttributeDefinitionIn(ApiModel):
    key: str
    label: str

    @field_validator("label")
    @classmethod
    def _validate_label(cls, label: str) -> str:
        return _label_must_not_be_blank(label)


class AttributeDefinitionUpdate(ApiModel):
    label: str

    @field_validator("label")
    @classmethod
    def _validate_label(cls, label: str) -> str:
        return _label_must_not_be_blank(label)


class AttributeDefinitionOut(ApiModel):
    id: str
    key: str
    label: str
    status: Literal["active", "deleted"]
    created_at: str
    updated_at: str
