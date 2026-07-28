import pytest

from src.members.exceptions import DuplicateMemberEmail, MemberNotFound
from src.members.schemas import MemberIn, MemberUpdate
from src.members.service import create_member, delete_member, get_member_or_raise, update_member


@pytest.mark.anyio
async def test_get_member_or_raise_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await get_member_or_raise("missing-id")


@pytest.mark.anyio
async def test_create_member_raises_for_duplicate_email(temp_member_store):
    await create_member(MemberIn(name="Jane Smith", email="jane@example.com"))

    with pytest.raises(DuplicateMemberEmail):
        await create_member(MemberIn(name="Another Jane", email="jane@example.com"))


@pytest.mark.anyio
async def test_update_member_updates_fields(temp_member_store):
    member = await create_member(MemberIn(name="Jane Smith", email="jane@example.com"))

    updated = await update_member(
        member.id,
        MemberUpdate(name="Jane Roe", email="jane.roe@example.com"),
    )

    assert updated.name == "Jane Roe"
    assert updated.email == "jane.roe@example.com"


@pytest.mark.anyio
async def test_delete_member_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await delete_member("missing-id")
