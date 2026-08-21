import uuid

from src.attribute_types import registry as attribute_types_registry
from src.members import utils
from src.members.events import broadcaster
from src.members.exceptions import (
    AttributeNotFound,
    DuplicateAttributeLabel,
    DuplicateMemberIdentifier,
    InvalidAttributeValue,
    MemberNotFound,
    UnknownAttributeType,
)
from src.members.schemas import (
    MemberAttributeIn,
    MemberAttributeUpdate,
    MemberIdentifier,
    MemberIn,
    MemberOut,
    MemberUpdate,
)


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


def _check_label_available(
    attributes: list[dict], label: str, exclude_attribute_id: str | None = None
) -> None:
    for attribute in attributes:
        if attribute["id"] != exclude_attribute_id and attribute["label"] == label:
            raise DuplicateAttributeLabel(label)


async def list_members() -> list[MemberOut]:
    data = await utils.load()
    return [utils.to_member_out(record) for record in data.values()]


async def create_member(payload: MemberIn) -> MemberOut:
    data = await utils.load()
    _check_identifiers_available(data, payload.identifiers)

    member_id = str(uuid.uuid7())
    now = utils.now_iso()
    record = {
        "id": member_id,
        "name": payload.name,
        "email": str(payload.email),
        "identifiers": [identifier.model_dump() for identifier in payload.identifiers],
        "created_at": now,
        "updated_at": now,
    }
    data[member_id] = record
    await utils.save(data)
    member = utils.to_member_out(record)
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

    if payload.name is not None:
        record["name"] = payload.name
    if payload.email is not None:
        record["email"] = str(payload.email)
    if payload.identifiers is not None:
        record["identifiers"] = [identifier.model_dump() for identifier in payload.identifiers]

    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    member = utils.to_member_out(record)
    broadcaster.publish_updated(member)
    return member


async def delete_member(member_id: str) -> None:
    data = await utils.load()
    if member_id not in data:
        raise MemberNotFound(member_id)

    del data[member_id]
    await utils.save(data)
    broadcaster.publish_deleted(member_id)


async def add_member_attribute(member_id: str, payload: MemberAttributeIn) -> MemberOut:
    data = await utils.load()
    record = data.get(member_id)
    if record is None:
        raise MemberNotFound(member_id)

    if not attribute_types_registry.attribute_type_exists(payload.key):
        raise UnknownAttributeType(payload.key)

    try:
        attribute_types_registry.validate_attribute_value(payload.key, payload.value)
    except ValueError as error:
        raise InvalidAttributeValue(str(error)) from error

    attributes = record.setdefault("attributes", [])
    _check_label_available(attributes, payload.label)

    attributes.append(
        {
            "id": str(uuid.uuid7()),
            "key": payload.key,
            "label": payload.label,
            "value": payload.value,
        }
    )

    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    member = utils.to_member_out(record)
    broadcaster.publish_updated(member)
    return member


async def update_member_attribute(
    member_id: str, attribute_id: str, payload: MemberAttributeUpdate
) -> MemberOut:
    data = await utils.load()
    record = data.get(member_id)
    if record is None:
        raise MemberNotFound(member_id)

    attributes = record.get("attributes", [])
    attribute = next((item for item in attributes if item["id"] == attribute_id), None)
    if attribute is None:
        raise AttributeNotFound(attribute_id)

    if payload.label is not None:
        _check_label_available(attributes, payload.label, exclude_attribute_id=attribute_id)

    if payload.value is not None:
        try:
            attribute_types_registry.validate_attribute_value(attribute["key"], payload.value)
        except ValueError as error:
            raise InvalidAttributeValue(str(error)) from error

    if payload.label is not None:
        attribute["label"] = payload.label
    if payload.value is not None:
        attribute["value"] = payload.value

    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    member = utils.to_member_out(record)
    broadcaster.publish_updated(member)
    return member


async def delete_member_attribute(member_id: str, attribute_id: str) -> MemberOut:
    data = await utils.load()
    record = data.get(member_id)
    if record is None:
        raise MemberNotFound(member_id)

    attributes = record.get("attributes", [])
    remaining = [item for item in attributes if item["id"] != attribute_id]
    if len(remaining) == len(attributes):
        raise AttributeNotFound(attribute_id)

    record["attributes"] = remaining
    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    member = utils.to_member_out(record)
    broadcaster.publish_updated(member)
    return member
