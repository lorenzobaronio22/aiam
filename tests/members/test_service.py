import pytest

from src.members.exceptions import DuplicateMemberIdentifier, MemberNotFound
from src.members.schemas import MemberIdentifier, MemberIn, MemberUpdate
from src.members.service import create_member, delete_member, get_member_or_raise, update_member


@pytest.mark.anyio
async def test_get_member_or_raise_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await get_member_or_raise("missing-id")


@pytest.mark.anyio
async def test_create_member_raises_for_duplicate_identifier(temp_member_store):
    identifier = MemberIdentifier(type="tax_id", country="IT", value="RSSMRA80A01H501U")
    await create_member(
        MemberIn(name="Jane Smith", identifiers=[identifier])
      )

    with pytest.raises(DuplicateMemberIdentifier):
        await create_member(
            MemberIn(name="Another Jane", identifiers=[identifier])
          )


@pytest.mark.anyio
async def test_update_member_raises_for_duplicate_identifier(temp_member_store):
    identifier = MemberIdentifier(type="tax_id", country="IT", value="RSSMRA80A01H501U")
    await create_member(
        MemberIn(name="Jane Smith", identifiers=[identifier])
      )
    other = await create_member(MemberIn(name="John Doe"))

    with pytest.raises(DuplicateMemberIdentifier):
        await update_member(other.id, MemberUpdate(identifiers=[identifier]))


@pytest.mark.anyio
async def test_update_member_updates_fields(temp_member_store):
    member = await create_member(MemberIn(name="Jane Smith"))

    updated = await update_member(
        member.id,
        MemberUpdate(name="Jane Roe"),
      )

    assert updated.name == "Jane Roe"


@pytest.mark.anyio
async def test_delete_member_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await delete_member("missing-id")
