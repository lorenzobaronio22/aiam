import pytest


@pytest.mark.anyio
async def test_healthcheck(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
