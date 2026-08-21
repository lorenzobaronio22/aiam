import pytest


async def _create_member(client, name="Jane Smith", email="jane@example.com"):
    response = await client.post("/members", json={"name": name, "email": email})
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.anyio
async def test_add_attribute_to_member(client, temp_member_store):
    member_id = await _create_member(client)

    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )

    assert response.status_code == 201
    member = response.json()
    assert len(member["attributes"]) == 1
    attribute = member["attributes"][0]
    assert attribute["key"] == "free_text_note"
    assert attribute["label"] == "Allergies"
    assert attribute["value"] == "Peanuts"
    assert attribute["id"]


@pytest.mark.anyio
async def test_add_multiple_attributes_of_the_same_type(client, temp_member_store):
    member_id = await _create_member(client)

    await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )
    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Emergency contact", "value": "Jane Doe"},
    )

    assert response.status_code == 201
    member = response.json()
    assert len(member["attributes"]) == 2
    labels = [attribute["label"] for attribute in member["attributes"]]
    assert labels == ["Allergies", "Emergency contact"]


@pytest.mark.anyio
async def test_add_attribute_rejects_blank_label(client, temp_member_store):
    member_id = await _create_member(client)

    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "   ", "value": "Peanuts"},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_edit_attribute_rejects_blank_label(client, temp_member_store):
    member_id = await _create_member(client)
    create_response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )
    attribute_id = create_response.json()["attributes"][0]["id"]

    response = await client.put(
        f"/members/{member_id}/attributes/{attribute_id}",
        json={"label": "   "},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_add_attribute_rejects_duplicate_label(client, temp_member_store):
    member_id = await _create_member(client)
    await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )

    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Shellfish"},
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_rename_attribute_rejects_duplicate_label(client, temp_member_store):
    member_id = await _create_member(client)
    create_response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )
    await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Emergency contact", "value": "Jane Doe"},
    )
    attribute_id = create_response.json()["attributes"][0]["id"]

    response = await client.put(
        f"/members/{member_id}/attributes/{attribute_id}",
        json={"label": "Emergency contact"},
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_edit_attribute_label_and_value(client, temp_member_store):
    member_id = await _create_member(client)
    create_response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )
    attribute_id = create_response.json()["attributes"][0]["id"]

    response = await client.put(
        f"/members/{member_id}/attributes/{attribute_id}",
        json={"label": "Food allergies", "value": "Peanuts and shellfish"},
    )

    assert response.status_code == 200
    attribute = response.json()["attributes"][0]
    assert attribute["id"] == attribute_id
    assert attribute["key"] == "free_text_note"
    assert attribute["label"] == "Food allergies"
    assert attribute["value"] == "Peanuts and shellfish"


@pytest.mark.anyio
async def test_remove_attribute_is_immediate(client, temp_member_store):
    member_id = await _create_member(client)
    create_response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Allergies", "value": "Peanuts"},
    )
    attribute_id = create_response.json()["attributes"][0]["id"]

    response = await client.delete(f"/members/{member_id}/attributes/{attribute_id}")

    assert response.status_code == 200
    assert response.json()["attributes"] == []


@pytest.mark.anyio
async def test_add_attribute_rejects_value_violating_type_rule(client, temp_member_store):
    member_id = await _create_member(client)

    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Notes", "value": "a" * 1001},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_edit_attribute_rejects_value_violating_type_rule(client, temp_member_store):
    member_id = await _create_member(client)
    create_response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Notes", "value": "short"},
    )
    attribute_id = create_response.json()["attributes"][0]["id"]

    response = await client.put(
        f"/members/{member_id}/attributes/{attribute_id}",
        json={"value": "a" * 1001},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_add_attribute_rejects_unknown_type(client, temp_member_store):
    member_id = await _create_member(client)

    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "not_a_real_type", "label": "Notes", "value": "hello"},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_attributes_are_displayed_in_insertion_order(client, temp_member_store):
    member_id = await _create_member(client)

    await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "First", "value": "1"},
    )
    await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Second", "value": "2"},
    )
    response = await client.post(
        f"/members/{member_id}/attributes",
        json={"key": "free_text_note", "label": "Third", "value": "3"},
    )

    labels = [attribute["label"] for attribute in response.json()["attributes"]]
    assert labels == ["First", "Second", "Third"]


@pytest.mark.anyio
async def test_add_attribute_to_missing_member_returns_404(client, temp_member_store):
    response = await client.post(
        "/members/missing-id/attributes",
        json={"key": "free_text_note", "label": "Notes", "value": "hello"},
    )

    assert response.status_code == 404


@pytest.mark.anyio
async def test_edit_missing_attribute_returns_404(client, temp_member_store):
    member_id = await _create_member(client)

    response = await client.put(
        f"/members/{member_id}/attributes/missing-attribute-id",
        json={"label": "Notes"},
    )

    assert response.status_code == 404
