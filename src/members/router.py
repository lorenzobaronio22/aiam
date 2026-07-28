from typing import Annotated

from fastapi import APIRouter, Response, status

from src.members import service
from src.members.dependencies import MemberDep
from src.members.schemas import MemberIn, MemberOut, MemberUpdate

router = APIRouter(tags=["members"])


@router.get("/members", response_model=list[MemberOut])
async def list_members() -> list[MemberOut]:
    return await service.list_members()


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
