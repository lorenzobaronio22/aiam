import pytest


async def _create_definition(client, label: str, key: str = "free_text_note") -> str:
    response = await client.post("/attribute-definitions", json={"key": key, "label": label})
    return response.json()["id"]


@pytest.mark.anyio
async def test_member_can_provide_value_for_active_definition(
    client, temp_member_store, temp_attribute_definitions_store
):
    definition_id = await _create_definition(client, "Allergies")

    response = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {definition_id: "Peanuts"},
        },
    )

    assert response.status_code == 201
    attribute = response.json()["attributes"][0]
    assert attribute["definition_id"] == definition_id
    assert attribute["label"] == "Allergies"
    assert attribute["value"] == "Peanuts"


@pytest.mark.anyio
async def test_member_attribute_value_is_optional(
    client, temp_member_store, temp_attribute_definitions_store
):
    definition_id = await _create_definition(client, "Allergies")

    response = await client.post(
        "/members", json={"name": "Jane Smith", "email": "jane@example.com"}
    )

    assert response.status_code == 201
    attribute = response.json()["attributes"][0]
    assert attribute["definition_id"] == definition_id
    assert attribute["value"] == ""


@pytest.mark.anyio
async def test_member_rejects_unknown_definition_id(
    client, temp_member_store, temp_attribute_definitions_store
):
    response = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {"missing-definition": "value"},
        },
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_member_rejects_value_violating_type_rule(
    client, temp_member_store, temp_attribute_definitions_store
):
    definition_id = await _create_definition(client, "Notes")

    response = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {definition_id: "x" * 1001},
        },
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_soft_deleting_definition_hides_field_and_value(
    client, temp_member_store, temp_attribute_definitions_store
):
    definition_id = await _create_definition(client, "Allergies")
    member = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {definition_id: "Peanuts"},
        },
    )
    member_id = member.json()["id"]

    await client.delete(f"/attribute-definitions/{definition_id}")

    response = await client.get(f"/members/{member_id}")

    assert response.json()["attributes"] == []


@pytest.mark.anyio
async def test_restoring_definition_reveals_previous_value(
    client, temp_member_store, temp_attribute_definitions_store
):
    definition_id = await _create_definition(client, "Allergies")
    member = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {definition_id: "Peanuts"},
        },
    )
    member_id = member.json()["id"]

    await client.delete(f"/attribute-definitions/{definition_id}")
    await client.post(f"/attribute-definitions/{definition_id}/restore")

    response = await client.get(f"/members/{member_id}")

    assert response.json()["attributes"][0]["value"] == "Peanuts"


@pytest.mark.anyio
async def test_update_member_preserves_hidden_value_of_soft_deleted_definition(
    client, temp_member_store, temp_attribute_definitions_store
):
    kept_id = await _create_definition(client, "Allergies")
    hidden_id = await _create_definition(client, "Emergency contact")
    member = await client.post(
        "/members",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {kept_id: "Peanuts", hidden_id: "555-0100"},
        },
    )
    member_id = member.json()["id"]

    await client.delete(f"/attribute-definitions/{hidden_id}")

    # The form only knows about active definitions, so it only resends the visible one.
    await client.put(
        f"/members/{member_id}",
        json={
            "name": "Jane Smith",
            "email": "jane@example.com",
            "attributes": {kept_id: "Peanuts"},
        },
    )

    await client.post(f"/attribute-definitions/{hidden_id}/restore")

    response = await client.get(f"/members/{member_id}")
    values = {item["definition_id"]: item["value"] for item in response.json()["attributes"]}
    assert values[hidden_id] == "555-0100"


@pytest.mark.anyio
async def test_member_attributes_displayed_in_insertion_order(
    client, temp_member_store, temp_attribute_definitions_store
):
    first_id = await _create_definition(client, "Allergies")
    second_id = await _create_definition(client, "Emergency contact")

    response = await client.post(
        "/members", json={"name": "Jane Smith", "email": "jane@example.com"}
    )

    ids = [item["definition_id"] for item in response.json()["attributes"]]
    assert ids == [first_id, second_id]
