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
async def test_current_registry_contains_only_free_text_note(client):
    response = await client.get("/attribute-types")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["key"] == "free_text_note"
    assert body[0]["name"] == "Free Text Note"
    assert "1000 characters" in body[0]["description"]
    assert "blank" in body[0]["description"]


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
