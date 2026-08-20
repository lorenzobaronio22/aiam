import asyncio
import json

import pytest

from src.members.events import broadcaster


@pytest.mark.anyio
async def test_create_member_allows_duplicate_email(client, temp_member_store):
    first = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com"},
    )
    second = await client.post(
        "/members",
        json={"name": "Another Jane", "email": "jane@example.com"},
    )

    assert first.status_code == 201
    assert second.status_code == 201


@pytest.mark.anyio
async def test_create_member_rejects_duplicate_identifier(client, temp_member_store):
    identifier = {"type": "tax_id", "country": "IT", "value": "RSSMRA80A01H501U"}
    first = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com", "identifiers": [identifier]},
    )
    duplicate = await client.post(
        "/members",
        json={"name": "Another Jane", "email": "jane2@example.com", "identifiers": [identifier]},
    )

    assert first.status_code == 201
    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_member_crud_lifecycle(client, temp_member_store):
    identifier = {"type": "tax_id", "country": "IT", "value": "RSSMRA80A01H501U"}
    create_response = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com", "identifiers": [identifier]},
    )

    assert create_response.status_code == 201
    created = create_response.json()
    member_id = created["id"]
    assert created["identifiers"] == [identifier]

    get_response = await client.get(f"/members/{member_id}")
    assert get_response.status_code == 200
    assert get_response.json()["email"] == "jane@example.com"
    assert get_response.json()["identifiers"] == [identifier]

    patch_response = await client.patch(
        f"/members/{member_id}",
        json={"name": "Jane Doe"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["name"] == "Jane Doe"
    assert patch_response.json()["identifiers"] == [identifier]

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


@pytest.mark.anyio
async def test_members_events_stream_emits_created_event(client, temp_member_store):
    # httpx's ASGITransport fully drains the app before returning a response, so an
    # infinite SSE generator can't be consumed via client.stream(); call the route's
    # generator directly instead and drive the real create through the HTTP client.
    from src.members.router import stream_member_events

    class FakeRequest:
        async def is_disconnected(self) -> bool:
            return False

    broadcaster._subscribers.clear()
    stream = stream_member_events(FakeRequest())
    next_event_task = asyncio.create_task(stream.__anext__())
    await asyncio.sleep(0)  # let the generator subscribe before publishing
    assert broadcaster._subscribers

    create_response = await client.post(
        "/members",
        json={"name": "Jane Smith", "email": "jane@example.com"},
    )
    assert create_response.status_code == 201

    try:
        sse_event = await asyncio.wait_for(next_event_task, timeout=1)
    finally:
        await stream.aclose()

    assert sse_event.event == "created"
    assert sse_event.data.member.email == "jane@example.com"
