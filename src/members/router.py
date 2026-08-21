
from collections.abc import AsyncIterable

from fastapi import APIRouter, Request, Response, status
from fastapi.sse import EventSourceResponse, ServerSentEvent

from src.members import service
from src.members.dependencies import MemberDep
from src.members.events import broadcaster
from src.members.schemas import (
    MemberAttributeIn,
    MemberAttributeUpdate,
    MemberEventPayload,
    MemberIn,
    MemberOut,
    MemberUpdate,
)

router = APIRouter(tags=["members"])


@router.get("/members", response_model=list[MemberOut])
async def list_members() -> list[MemberOut]:
    return await service.list_members()


@router.get("/members/events", response_class=EventSourceResponse)
async def stream_member_events(request: Request) -> AsyncIterable[ServerSentEvent]:
    async for event in broadcaster.subscribe():
        if await request.is_disconnected():
            break
        payload = MemberEventPayload(member_id=event.member_id, member=event.member)
        yield ServerSentEvent(data=payload, event=event.action, id=str(event.event_id))


@router.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def create_member(body: MemberIn) -> MemberOut:
    return await service.create_member(body)


@router.get("/members/{member_id}", response_model=MemberOut)
async def get_member(member: MemberDep) -> MemberOut:
    return member


@router.put("/members/{member_id}", response_model=MemberOut)
async def update_member(member_id: str, body: MemberUpdate) -> MemberOut:
    return await service.update_member(member_id, body)


@router.patch("/members/{member_id}", response_model=MemberOut)
async def patch_member(member_id: str, body: MemberUpdate) -> MemberOut:
    return await service.update_member(member_id, body)


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(member_id: str) -> Response:
    await service.delete_member(member_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/members/{member_id}/attributes",
    response_model=MemberOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_member_attribute(member_id: str, body: MemberAttributeIn) -> MemberOut:
    return await service.add_member_attribute(member_id, body)


@router.put("/members/{member_id}/attributes/{attribute_id}", response_model=MemberOut)
async def update_member_attribute(
    member_id: str, attribute_id: str, body: MemberAttributeUpdate
) -> MemberOut:
    return await service.update_member_attribute(member_id, attribute_id, body)


@router.delete("/members/{member_id}/attributes/{attribute_id}", response_model=MemberOut)
async def delete_member_attribute(member_id: str, attribute_id: str) -> MemberOut:
    return await service.delete_member_attribute(member_id, attribute_id)
