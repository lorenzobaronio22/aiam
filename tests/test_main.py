import pytest


@pytest.mark.anyio
async def test_app_serves_frontend_index(client):
    response = await client.get("/app/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<div id=\"app\"></div>" in response.text


@pytest.mark.anyio
async def test_app_members_route_returns_404_for_non_navigation_requests(client):
    response = await client.get("/app/members")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_app_members_route_serves_spa_for_navigation_requests(client):
    response = await client.get(
        "/app/members",
        headers={"accept": "text/html"},
    )

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<div id=\"app\"></div>" in response.text
