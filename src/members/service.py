import uuid

from src.attribute_definitions import service as attribute_definitions_service
from src.attribute_types import registry as attribute_types_registry
from src.members import utils
from src.members.events import broadcaster
from src.members.exceptions import (
    DuplicateMemberIdentifier,
    InvalidAttributeValue,
    MemberNotFound,
    UnknownAttributeDefinition,
)
from src.members.schemas import MemberIdentifier, MemberIn, MemberOut, MemberUpdate


def _check_identifiers_available(
    data: dict[str, dict],
    identifiers: list[MemberIdentifier],
    exclude_id: str | None = None,
) -> None:
    for identifier in identifiers:
        if utils.identifier_exists(
            data, identifier.type, identifier.country, identifier.value, exclude_id=exclude_id
        ):
            raise DuplicateMemberIdentifier(identifier.type, identifier.value)


async def _validate_attribute_values(attributes: dict[str, str]) -> None:
    active_definitions = {
        definition.id: definition
        for definition in await attribute_definitions_service.list_active_definitions()
    }

    for definition_id, value in attributes.items():
        definition = active_definitions.get(definition_id)
        if definition is None:
            raise UnknownAttributeDefinition(definition_id)

        try:
            attribute_types_registry.validate_attribute_value(definition.key, value)
        except ValueError as error:
            raise InvalidAttributeValue(str(error)) from error


async def list_members() -> list[MemberOut]:
    data = await utils.load()
    active_definitions = await attribute_definitions_service.list_active_definitions()
    return [utils.to_member_out(record, active_definitions) for record in data.values()]


async def create_member(payload: MemberIn) -> MemberOut:
    data = await utils.load()
    _check_identifiers_available(data, payload.identifiers)
    await _validate_attribute_values(payload.attributes)

    member_id = str(uuid.uuid7())
    now = utils.now_iso()
    record = {
         "id": member_id,
         "name": payload.name,
         "identifiers": [identifier.model_dump() for identifier in payload.identifiers],
         "attribute_values": dict(payload.attributes),
         "created_at": now,
         "updated_at": now,
      }
    data[member_id] = record
    await utils.save(data)
    active_definitions = await attribute_definitions_service.list_active_definitions()
    member = utils.to_member_out(record, active_definitions)
    broadcaster.publish_created(member)
    return member


async def get_member_or_raise(member_id: str) -> dict:
    data = await utils.load()
    record = data.get(member_id)
    if record is None:
        raise MemberNotFound(member_id)
    return record


async def update_member(member_id: str, payload: MemberUpdate) -> MemberOut:
    data = await utils.load()
    record = data.get(member_id)
    if record is None:
        raise MemberNotFound(member_id)

    if payload.identifiers is not None:
        _check_identifiers_available(data, payload.identifiers, exclude_id=member_id)

    if payload.attributes is not None:
        await _validate_attribute_values(payload.attributes)

    if payload.name is not None:
        record["name"] = payload.name
    if payload.identifiers is not None:
        record["identifiers"] = [identifier.model_dump() for identifier in payload.identifiers]
    if payload.attributes is not None:
        # Upsert only the given definition ids so hidden (soft-deleted) values survive.
        record.setdefault("attribute_values", {}).update(payload.attributes)

    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    active_definitions = await attribute_definitions_service.list_active_definitions()
    member = utils.to_member_out(record, active_definitions)
    broadcaster.publish_updated(member)
    return member


async def delete_member(member_id: str) -> None:
    data = await utils.load()
    if member_id not in data:
        raise MemberNotFound(member_id)

    del data[member_id]
    await utils.save(data)
    broadcaster.publish_deleted(member_id)
