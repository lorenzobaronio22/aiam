from typing import Annotated

from fastapi import Depends

from src.members import service, utils
from src.members.schemas import MemberOut


async def valid_member(member_id: str) -> MemberOut:
    record = await service.get_member_or_raise(member_id)
    return utils.to_member_out(record)


MemberDep = Annotated[MemberOut, Depends(valid_member)]
