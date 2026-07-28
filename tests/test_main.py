import json
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.members import constants, utils


class DummyLock:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


def _configure_store(tmp_path: Path) -> None:
    data_dir = tmp_path / "data"
    data_file = data_dir / "members.json"
    constants.DATA_DIR = data_dir
    constants.DATA_FILE = data_file
    utils._store_lock = DummyLock()


@pytest.mark.anyio
async def test_healthcheck():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.anyio
async def test_member_crud(tmp_path):
    _configure_store(tmp_path)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/members",
            json={"name": "Jane Smith", "email": "jane@example.com"},
        )

        assert create_response.status_code == 201
        member = create_response.json()
        member_id = member["id"]

        duplicate_response = await client.post(
            "/members",
            json={"name": "Another Jane", "email": "jane@example.com"},
        )
        assert duplicate_response.status_code == 409

        get_response = await client.get(f"/members/{member_id}")
        assert get_response.status_code == 200
        assert get_response.json()["email"] == "jane@example.com"

        patch_response = await client.patch(
            f"/members/{member_id}",
            json={"name": "Jane Doe"},
        )
        assert patch_response.status_code == 200
        assert patch_response.json()["name"] == "Jane Doe"

        update_response = await client.put(
            f"/members/{member_id}",
            json={"name": "Jane Roe", "email": "jane.roe@example.com"},
        )
        assert update_response.status_code == 200
        assert update_response.json()["email"] == "jane.roe@example.com"

        delete_response = await client.delete(f"/members/{member_id}")
        assert delete_response.status_code == 204

        missing_response = await client.get(f"/members/{member_id}")
        assert missing_response.status_code == 404


@pytest.mark.anyio
async def test_json_store_is_created(tmp_path):
    _configure_store(tmp_path)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/members",
            json={"name": "Jane Smith", "email": "jane@example.com"},
        )

    assert response.status_code == 201
    assert constants.DATA_FILE.exists()
    stored = json.loads(constants.DATA_FILE.read_text())
    assert len(stored) == 1
