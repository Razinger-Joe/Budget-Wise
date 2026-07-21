import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test the health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_register_user(client):
    """Test user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Test that duplicate email registration fails."""
    user_data = {
        "email": "duplicate@example.com",
        "password": "securepassword123",
        "full_name": "First User",
    }
    response1 = await client.post("/api/v1/auth/register", json=user_data)
    assert response1.status_code == 201

    response2 = await client.post("/api/v1/auth/register", json=user_data)
    assert response2.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    """Test login with valid credentials."""
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "securepassword123",
            "full_name": "Login User",
        },
    )

    # Login using form data (OAuth2PasswordRequestForm)
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    """Test login with wrong password."""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "securepassword123",
            "full_name": "Wrong User",
        },
    )

    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_short_password(client):
    """Test that short passwords are rejected."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "short@example.com",
            "password": "short",
            "full_name": "Short Password User",
        },
    )
    assert response.status_code == 422
