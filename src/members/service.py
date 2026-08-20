import uuid

from src.members import utils
from src.members.events import broadcaster
from src.members.exceptions import DuplicateMemberIdentifier, MemberNotFound
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
