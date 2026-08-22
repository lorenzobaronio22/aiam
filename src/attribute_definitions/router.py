from fastapi import APIRouter, status

from src.attribute_definitions import service
from src.attribute_definitions.schemas import (
    AttributeDefinitionIn,
    AttributeDefinitionOut,
    AttributeDefinitionUpdate,
)

router = APIRouter(tags=["attribute-definitions"])


@router.get("/attribute-definitions", response_model=list[AttributeDefinitionOut])
async def list_attribute_definitions() -> list[AttributeDefinitionOut]:
    return await service.list_definitions()


@router.post(
    "/attribute-definitions",
    response_model=AttributeDefinitionOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_attribute_definition(body: AttributeDefinitionIn) -> AttributeDefinitionOut:
    return await service.create_definition(body)


@router.put("/attribute-definitions/{definition_id}", response_model=AttributeDefinitionOut)
async def update_attribute_definition(
    definition_id: str, body: AttributeDefinitionUpdate
) -> AttributeDefinitionOut:
    return await service.update_definition_label(definition_id, body)


@router.delete("/attribute-definitions/{definition_id}", response_model=AttributeDefinitionOut)
async def delete_attribute_definition(definition_id: str) -> AttributeDefinitionOut:
    return await service.delete_definition(definition_id)


@router.post(
    "/attribute-definitions/{definition_id}/restore", response_model=AttributeDefinitionOut
)
async def restore_attribute_definition(definition_id: str) -> AttributeDefinitionOut:
    return await service.restore_definition(definition_id)
