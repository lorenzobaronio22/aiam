import pytest

from src.members.dependencies import valid_member
from src.members.exceptions import MemberNotFound
from src.members.schemas import MemberIn
from src.members.service import create_member


@pytest.mark.anyio
async def test_valid_member_returns_member_when_found(temp_member_store):
    created = await create_member(MemberIn(name="Jane Smith", email="jane@example.com"))

    resolved = await valid_member(created.id)

    assert resolved.id == created.id
    assert resolved.email == "jane@example.com"


@pytest.mark.anyio
async def test_valid_member_raises_for_unknown_member(temp_member_store):
    with pytest.raises(MemberNotFound):
        await valid_member("missing-id")
