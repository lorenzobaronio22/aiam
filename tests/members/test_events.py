import asyncio

import pytest

from src.members.events import MemberEventBroadcaster
from src.members.schemas import MemberOut


def make_member(member_id: str = "member-1") -> MemberOut:
    return MemberOut(
        id=member_id,
        name="Jane Smith",
        email="jane@example.com",
        created_at="2026-01-01T00:00:00+00:00",
        updated_at="2026-01-01T00:00:00+00:00",
    )


@pytest.mark.anyio
async def test_subscriber_receives_published_event():
    broadcaster = MemberEventBroadcaster()
    subscription = broadcaster.subscribe()
    task = asyncio.create_task(subscription.__anext__())
    await asyncio.sleep(0)  # let the subscriber register before publishing

    member = make_member()
    broadcaster.publish_created(member)

    event = await asyncio.wait_for(task, timeout=1)
    assert event.action == "created"
    assert event.member is member
    assert event.member_id == member.id


@pytest.mark.anyio
async def test_all_subscribers_receive_the_same_event():
    broadcaster = MemberEventBroadcaster()
    first_subscription = broadcaster.subscribe()
    second_subscription = broadcaster.subscribe()
    first_task = asyncio.create_task(first_subscription.__anext__())
    second_task = asyncio.create_task(second_subscription.__anext__())
    await asyncio.sleep(0)

    broadcaster.publish_deleted("member-1")

    first_event = await asyncio.wait_for(first_task, timeout=1)
    second_event = await asyncio.wait_for(second_task, timeout=1)

    assert first_event.action == "deleted"
    assert first_event.member_id == "member-1"
    assert first_event.member is None
    assert second_event.action == "deleted"
    assert second_event.member_id == "member-1"


@pytest.mark.anyio
async def test_subscriber_removed_when_its_task_is_cancelled():
    broadcaster = MemberEventBroadcaster()
    subscription = broadcaster.subscribe()
    task = asyncio.create_task(subscription.__anext__())
    await asyncio.sleep(0)
    assert len(broadcaster._subscribers) == 1

    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    assert len(broadcaster._subscribers) == 0
