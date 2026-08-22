import uuid

from src.attribute_definitions import utils
from src.attribute_definitions.exceptions import (
    AttributeDefinitionNotFound,
    DuplicateDefinitionLabel,
    UnknownAttributeType,
)
from src.attribute_definitions.schemas import (
    AttributeDefinitionIn,
    AttributeDefinitionOut,
    AttributeDefinitionUpdate,
)
from src.attribute_types import registry as attribute_types_registry


async def list_definitions() -> list[AttributeDefinitionOut]:
    data = await utils.load()
    return [utils.to_definition_out(record) for record in data.values()]


async def list_active_definitions() -> list[AttributeDefinitionOut]:
    return [definition for definition in await list_definitions() if definition.status == "active"]


async def create_definition(payload: AttributeDefinitionIn) -> AttributeDefinitionOut:
    data = await utils.load()

    if not attribute_types_registry.attribute_type_exists(payload.key):
        raise UnknownAttributeType(payload.key)

    if not utils.label_available(data, payload.label):
        raise DuplicateDefinitionLabel(payload.label)

    definition_id = str(uuid.uuid7())
    now = utils.now_iso()
    record = {
        "id": definition_id,
        "key": payload.key,
        "label": payload.label,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    data[definition_id] = record
    await utils.save(data)
    return utils.to_definition_out(record)


async def update_definition_label(
    definition_id: str, payload: AttributeDefinitionUpdate
) -> AttributeDefinitionOut:
    data = await utils.load()
    record = data.get(definition_id)
    if record is None:
        raise AttributeDefinitionNotFound(definition_id)

    if not utils.label_available(data, payload.label, exclude_id=definition_id):
        raise DuplicateDefinitionLabel(payload.label)

    record["label"] = payload.label
    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    return utils.to_definition_out(record)


async def delete_definition(definition_id: str) -> AttributeDefinitionOut:
    data = await utils.load()
    record = data.get(definition_id)
    if record is None:
        raise AttributeDefinitionNotFound(definition_id)

    record["status"] = "deleted"
    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    return utils.to_definition_out(record)


async def restore_definition(definition_id: str) -> AttributeDefinitionOut:
    data = await utils.load()
    record = data.get(definition_id)
    if record is None:
        raise AttributeDefinitionNotFound(definition_id)

    if not utils.label_available(data, record["label"], exclude_id=definition_id):
        raise DuplicateDefinitionLabel(record["label"])

    record["status"] = "active"
    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    return utils.to_definition_out(record)
