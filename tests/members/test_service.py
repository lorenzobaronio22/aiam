import pytest

from src.members.exceptions import DuplicateMemberIdentifier, MemberNotFound
from src.members.schemas import MemberIdentifier, MemberIn, MemberUpdate
from src.members.service import create_member, delete_member, get_member_or_raise, update_member


@pytest.mark.anyio
async def test_get_member_or_raise_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await get_member_or_raise("missing-id")


@pytest.mark.anyio
async def test_create_member_allows_duplicate_email(temp_member_store):
    await create_member(MemberIn(name="Jane Smith", email="jane@example.com"))

    duplicate = await create_member(MemberIn(name="Another Jane", email="jane@example.com"))

    assert duplicate.email == "jane@example.com"


@pytest.mark.anyio
async def test_create_member_raises_for_duplicate_identifier(temp_member_store):
    identifier = MemberIdentifier(type="tax_id", country="IT", value="RSSMRA80A01H501U")
    await create_member(
        MemberIn(name="Jane Smith", email="jane@example.com", identifiers=[identifier])
    )

    with pytest.raises(DuplicateMemberIdentifier):
        await create_member(
            MemberIn(name="Another Jane", email="jane2@example.com", identifiers=[identifier])
        )


@pytest.mark.anyio
async def test_update_member_raises_for_duplicate_identifier(temp_member_store):
    identifier = MemberIdentifier(type="tax_id", country="IT", value="RSSMRA80A01H501U")
    await create_member(
        MemberIn(name="Jane Smith", email="jane@example.com", identifiers=[identifier])
    )
    other = await create_member(MemberIn(name="John Doe", email="john@example.com"))

    with pytest.raises(DuplicateMemberIdentifier):
        await update_member(other.id, MemberUpdate(identifiers=[identifier]))


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
