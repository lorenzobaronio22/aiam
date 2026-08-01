import pytest


@pytest.mark.anyio
async def test_healthcheck(client):
    response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.anyio
async def test_app_serves_frontend_index(client):
    response = await client.get("/app")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<div id=\"app\"></div>" in response.text


@pytest.mark.anyio
async def test_app_spa_fallback_for_client_routes(client):
    response = await client.get("/app/some-client-route")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<div id=\"app\"></div>" in response.text
