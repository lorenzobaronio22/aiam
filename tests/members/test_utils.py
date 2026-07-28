from src.members.utils import email_exists


def test_email_exists_respects_excluded_member_id():
    data = {
        "1": {"id": "1", "email": "jane@example.com"},
        "2": {"id": "2", "email": "john@example.com"},
    }

    assert email_exists(data, "jane@example.com") is True
    assert email_exists(data, "jane@example.com", exclude_id="1") is False
