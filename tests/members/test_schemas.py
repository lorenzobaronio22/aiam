import pytest
from pydantic import ValidationError

from src.members.schemas import MemberIn, MemberUpdate


def test_member_in_rejects_duplicate_identifier_types():
    with pytest.raises(ValidationError):
        MemberIn(
            name="Jane Smith",
            identifiers=[
               {"type": "tax_id", "country": "IT", "value": "RSSMRA80A01H501U"},
               {"type": "tax_id", "country": "IT", "value": "VRDLGU85M01H501Z"},
             ],
        )


def test_member_in_rejects_blank_identifier_value():
    with pytest.raises(ValidationError):
        MemberIn(
            name="Jane Smith",
            identifiers=[{"type": "tax_id", "country": "IT", "value": "   "}],
         )


def test_member_in_defaults_to_no_identifiers():
    member = MemberIn(name="Jane Smith")

    assert member.identifiers == []


def test_member_update_allows_omitted_identifiers():
    update = MemberUpdate(name="Jane Roe")

    assert update.identifiers is None


def test_member_update_rejects_duplicate_identifier_types():
    with pytest.raises(ValidationError):
        MemberUpdate(
            identifiers=[
                {"type": "tax_id", "country": "IT", "value": "RSSMRA80A01H501U"},
                {"type": "tax_id", "country": "IT", "value": "VRDLGU85M01H501Z"},
            ]
        )
