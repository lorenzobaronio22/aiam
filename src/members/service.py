import uuid

from src.members import utils
from src.members.exceptions import DuplicateMemberEmail, MemberNotFound
from src.members.schemas import MemberIn, MemberOut, MemberUpdate


async def list_members() -> list[MemberOut]:
    data = await utils.load()
    return [utils.to_member_out(record) for record in data.values()]


async def create_member(payload: MemberIn) -> MemberOut:
    data = await utils.load()
    if utils.email_exists(data, str(payload.email)):
        raise DuplicateMemberEmail(str(payload.email))

    member_id = str(uuid.uuid4())
    now = utils.now_iso()
    record = {
        "id": member_id,
        "name": payload.name,
        "email": str(payload.email),
        "created_at": now,
        "updated_at": now,
    }
    data[member_id] = record
    await utils.save(data)
    return utils.to_member_out(record)


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

    if payload.email is not None and utils.email_exists(
        data, str(payload.email), exclude_id=member_id
    ):
        raise DuplicateMemberEmail(str(payload.email))

    if payload.name is not None:
        record["name"] = payload.name
    if payload.email is not None:
        record["email"] = str(payload.email)

    record["updated_at"] = utils.now_iso()
    await utils.save(data)
    return utils.to_member_out(record)


async def delete_member(member_id: str) -> None:
    data = await utils.load()
    if member_id not in data:
        raise MemberNotFound(member_id)

    del data[member_id]
    await utils.save(data)
