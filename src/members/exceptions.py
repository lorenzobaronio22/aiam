from fastapi import status

from src.exceptions import ProblemError


class MemberNotFound(ProblemError):
    def __init__(self, member_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            detail=f"Member with id '{member_id}' not found.",
        )


class DuplicateMemberEmail(ProblemError):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            detail=f"A member with email '{email}' already exists.",
        )
