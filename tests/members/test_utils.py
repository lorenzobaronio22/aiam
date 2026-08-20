from src.members import constants, utils
from src.members.utils import identifier_exists


def test_identifier_exists_respects_excluded_member_id():
    data = {
        "1": {
            "id": "1",
            "identifiers": [{"type": "tax_id", "country": "IT", "value": "RSSMRA80A01H501U"}],
        },
        "2": {
            "id": "2",
            "identifiers": [{"type": "tax_id", "country": "IT", "value": "VRDLGU85M01H501Z"}],
        },
    }

    assert identifier_exists(data, "tax_id", "IT", "RSSMRA80A01H501U") is True
    assert identifier_exists(data, "tax_id", "IT", "RSSMRA80A01H501U", exclude_id="1") is False
    assert identifier_exists(data, "tax_id", "IT", "missing-value") is False


def test_identifier_exists_ignores_records_without_identifiers():
    data = {"1": {"id": "1"}}

    assert identifier_exists(data, "tax_id", "IT", "RSSMRA80A01H501U") is False


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
