from src.members import constants, utils
from src.members.utils import email_exists


def test_email_exists_respects_excluded_member_id():
    data = {
        "1": {"id": "1", "email": "jane@example.com"},
        "2": {"id": "2", "email": "john@example.com"},
    }

    assert email_exists(data, "jane@example.com") is True
    assert email_exists(data, "jane@example.com", exclude_id="1") is False


def test_load_sync_returns_empty_dict_for_corrupt_json_file(tmp_path):
    original_dir = constants.DATA_DIR
    original_file = constants.DATA_FILE
    constants.DATA_DIR = tmp_path
    constants.DATA_FILE = tmp_path / "members.json"
    constants.DATA_FILE.write_text("{not valid json")

    try:
        assert utils.load_sync() == {}
    finally:
        constants.DATA_DIR = original_dir
        constants.DATA_FILE = original_file
