import pytest


@pytest.mark.anyio
async def test_create_attribute_definition(client, temp_attribute_definitions_store):
    response = await client.post(
        "/attribute-definitions",
        json={"key": "free_text_note", "label": "Allergies"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["key"] == "free_text_note"
    assert body["label"] == "Allergies"
    assert body["status"] == "active"
    assert body["id"]


@pytest.mark.anyio
async def test_create_multiple_definitions_of_the_same_type(
    client, temp_attribute_definitions_store
):
    first = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    second = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Emergency contact"}
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] != second.json()["id"]


@pytest.mark.anyio
async def test_create_rejects_blank_label(client, temp_attribute_definitions_store):
    response = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "   "}
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_create_rejects_unknown_attribute_type(client, temp_attribute_definitions_store):
    response = await client.post(
        "/attribute-definitions", json={"key": "unknown_type", "label": "Allergies"}
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_create_rejects_duplicate_active_label(client, temp_attribute_definitions_store):
    await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )

    duplicate = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )

    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_label_freed_by_soft_delete_can_be_reused(client, temp_attribute_definitions_store):
    created = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    definition_id = created.json()["id"]

    await client.delete(f"/attribute-definitions/{definition_id}")

    reused = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )

    assert reused.status_code == 201


@pytest.mark.anyio
async def test_edit_definition_updates_label_only(client, temp_attribute_definitions_store):
    created = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    definition_id = created.json()["id"]

    response = await client.put(
        f"/attribute-definitions/{definition_id}", json={"label": "Food allergies"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["label"] == "Food allergies"
    assert body["key"] == "free_text_note"


@pytest.mark.anyio
async def test_edit_rejects_duplicate_active_label(client, temp_attribute_definitions_store):
    await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    other = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Emergency contact"}
    )

    response = await client.put(
        f"/attribute-definitions/{other.json()['id']}", json={"label": "Allergies"}
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_soft_delete_is_immediate_and_reversible(client, temp_attribute_definitions_store):
    created = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    definition_id = created.json()["id"]

    response = await client.delete(f"/attribute-definitions/{definition_id}")

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"


@pytest.mark.anyio
async def test_restore_reactivates_definition(client, temp_attribute_definitions_store):
    created = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    definition_id = created.json()["id"]
    await client.delete(f"/attribute-definitions/{definition_id}")

    response = await client.post(f"/attribute-definitions/{definition_id}/restore")

    assert response.status_code == 200
    assert response.json()["status"] == "active"


@pytest.mark.anyio
async def test_restore_rejects_on_label_collision(client, temp_attribute_definitions_store):
    created = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    definition_id = created.json()["id"]
    await client.delete(f"/attribute-definitions/{definition_id}")

    await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )

    response = await client.post(f"/attribute-definitions/{definition_id}/restore")

    assert response.status_code == 409


@pytest.mark.anyio
async def test_list_shows_active_and_deleted_with_status(client, temp_attribute_definitions_store):
    active = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    deleted = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Emergency contact"}
    )
    await client.delete(f"/attribute-definitions/{deleted.json()['id']}")

    response = await client.get("/attribute-definitions")

    assert response.status_code == 200
    statuses = {item["id"]: item["status"] for item in response.json()}
    assert statuses[active.json()["id"]] == "active"
    assert statuses[deleted.json()["id"]] == "deleted"


@pytest.mark.anyio
async def test_definitions_are_displayed_in_insertion_order(
    client, temp_attribute_definitions_store
):
    first = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Allergies"}
    )
    second = await client.post(
        "/attribute-definitions", json={"key": "free_text_note", "label": "Emergency contact"}
    )

    response = await client.get("/attribute-definitions")

    ids = [item["id"] for item in response.json()]
    assert ids == [first.json()["id"], second.json()["id"]]


@pytest.mark.anyio
async def test_edit_missing_definition_returns_404(client, temp_attribute_definitions_store):
    response = await client.put(
        "/attribute-definitions/missing-id", json={"label": "Anything"}
    )

    assert response.status_code == 404


@pytest.mark.anyio
async def test_delete_missing_definition_returns_404(client, temp_attribute_definitions_store):
    response = await client.delete("/attribute-definitions/missing-id")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_restore_missing_definition_returns_404(client, temp_attribute_definitions_store):
    response = await client.post("/attribute-definitions/missing-id/restore")

    assert response.status_code == 404
