from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from src.attribute_definitions import constants as attribute_definitions_constants
from src.attribute_definitions import utils as attribute_definitions_utils
from src.main import app
from src.members import constants, utils


class DummyLock:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client


@pytest.fixture
def temp_member_store(tmp_path: Path) -> Path:
    data_dir = tmp_path / "data"
    data_file = data_dir / "members.json"

    original_dir = constants.DATA_DIR
    original_file = constants.DATA_FILE
    original_lock = utils._store_lock

    constants.DATA_DIR = data_dir
    constants.DATA_FILE = data_file
    utils._store_lock = DummyLock()

    try:
        yield data_file
    finally:
        constants.DATA_DIR = original_dir
        constants.DATA_FILE = original_file
        utils._store_lock = original_lock


@pytest.fixture
def temp_attribute_definitions_store(tmp_path: Path) -> Path:
    data_dir = tmp_path / "data"
    data_file = data_dir / "attribute_definitions.json"

    original_dir = attribute_definitions_constants.DATA_DIR
    original_file = attribute_definitions_constants.DATA_FILE
    original_lock = attribute_definitions_utils._store_lock

    attribute_definitions_constants.DATA_DIR = data_dir
    attribute_definitions_constants.DATA_FILE = data_file
    attribute_definitions_utils._store_lock = DummyLock()

    try:
        yield data_file
    finally:
        attribute_definitions_constants.DATA_DIR = original_dir
        attribute_definitions_constants.DATA_FILE = original_file
        attribute_definitions_utils._store_lock = original_lock
