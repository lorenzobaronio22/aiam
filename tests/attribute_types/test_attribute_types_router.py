import pytest

from src.attribute_types import registry
from src.attribute_types.schemas import AttributeTypeOut


@pytest.mark.anyio
async def test_list_attribute_types_returns_every_registered_type(client):
    response = await client.get("/attribute-types")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == len(registry.ATTRIBUTE_TYPE_REGISTRY)
    for item in body:
        assert set(item.keys()) >= {"key", "name", "description"}


@pytest.mark.anyio
async def test_current_registry_contains_free_text_note_and_email(client):
    response = await client.get("/attribute-types")

    assert response.status_code == 200
    body = response.json()
    keys = {item["key"] for item in body}
    assert keys == {"free_text_note", "email"}

    email_type = next(item for item in body if item["key"] == "email")
    assert email_type["name"] == "Email"
    assert "valid email" in email_type["description"]
    assert "blank" in email_type["description"]


@pytest.mark.anyio
async def test_catalog_matches_backend_registry(client, monkeypatch):
    custom_registry = [
        AttributeTypeOut(key="type_a", name="Type A", description="First type."),
        AttributeTypeOut(key="type_b", name="Type B", description="Second type."),
    ]
    monkeypatch.setattr(registry, "ATTRIBUTE_TYPE_REGISTRY", custom_registry)

    response = await client.get("/attribute-types")

    assert response.status_code == 200
    assert response.json() == [
        {"key": "type_a", "name": "Type A", "description": "First type."},
        {"key": "type_b", "name": "Type B", "description": "Second type."},
    ]


@pytest.mark.anyio
async def test_empty_registry_returns_empty_list(client, monkeypatch):
    monkeypatch.setattr(registry, "ATTRIBUTE_TYPE_REGISTRY", [])

    response = await client.get("/attribute-types")

    assert response.status_code == 200
    assert response.json() == []
