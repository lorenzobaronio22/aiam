import asyncio
import itertools
from collections.abc import AsyncIterator
from typing import Literal

from src.members.schemas import MemberOut

MemberEventAction = Literal["created", "updated", "deleted"]


class MemberEvent:
    def __init__(
        self, event_id: int, action: MemberEventAction, member_id: str, member: MemberOut | None
    ):
        self.event_id = event_id
        self.action = action
        self.member_id = member_id
        self.member = member


class MemberEventBroadcaster:
    """In-process pub/sub for member change events. Single-worker only: subscribers
    live in this process's memory, so this does not fan out across multiple
    uvicorn workers or container replicas."""

    def __init__(self):
        self._subscribers: set[asyncio.Queue[MemberEvent]] = set()
        self._ids = itertools.count(1)

    def _publish(self, action: MemberEventAction, member_id: str, member: MemberOut | None) -> None:
        event = MemberEvent(next(self._ids), action, member_id, member)
        for queue in self._subscribers:
            queue.put_nowait(event)

    def publish_created(self, member: MemberOut) -> None:
        self._publish("created", member.id, member)

    def publish_updated(self, member: MemberOut) -> None:
        self._publish("updated", member.id, member)

    def publish_deleted(self, member_id: str) -> None:
        self._publish("deleted", member_id, None)

    async def subscribe(self) -> AsyncIterator[MemberEvent]:
        queue: asyncio.Queue[MemberEvent] = asyncio.Queue()
        self._subscribers.add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self._subscribers.discard(queue)


broadcaster = MemberEventBroadcaster()
