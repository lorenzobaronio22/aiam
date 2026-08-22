from typing import Annotated

from fastapi import Depends

from src.attribute_definitions import service as attribute_definitions_service
from src.members import service, utils
from src.members.schemas import MemberOut


async def valid_member(member_id: str) -> MemberOut:
    record = await service.get_member_or_raise(member_id)
    active_definitions = await attribute_definitions_service.list_active_definitions()
    return utils.to_member_out(record, active_definitions)


MemberDep = Annotated[MemberOut, Depends(valid_member)]
