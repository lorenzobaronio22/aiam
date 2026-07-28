import json

import pytest


@pytest.mark.anyio
async def test_create_member_rejects_duplicate_email(client, temp_member_store):
    first = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com"},
    )
    duplicate = await client.post(
        "/members",
        json={"name": "Another Jane", "email": "jane@example.com"},
    )

    assert first.status_code == 201
    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_member_crud_lifecycle(client, temp_member_store):
    create_response = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com"},
    )

    assert create_response.status_code == 201
    created = create_response.json()
    member_id = created["id"]

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
async def test_create_member_creates_json_store_file(client, temp_member_store):
    response = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com"},
    )

    assert response.status_code == 201
    assert temp_member_store.exists()
    stored = json.loads(temp_member_store.read_text())
    assert len(stored) == 1
