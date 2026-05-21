"""
Tests for /auth/register, /auth/login, /auth/me
"""
import pytest
from tests.conftest import register_user, login_user, auth_headers


class TestRegister:
    def test_register_standard_user(self, client):
        res = register_user(client, username="newuser1", email="newuser1@test.com")
        assert res.status_code == 201
        data = res.json()
        assert data["username"] == "newuser1"
        assert data["is_caregiver"] is False
        assert "hashed_password" not in data       # password NEVER returned

    def test_register_caregiver(self, client):
        res = register_user(client, username="cg_reg1",
                            email="cg_reg1@test.com", is_caregiver=True)
        assert res.status_code == 201
        assert res.json()["is_caregiver"] is True

    def test_register_duplicate_email(self, client):
        register_user(client, username="dupuser1", email="dup@test.com")
        res = register_user(client, username="dupuser2", email="dup@test.com")
        assert res.status_code == 400
        assert "email" in res.json()["detail"].lower()

    def test_register_duplicate_username(self, client):
        register_user(client, username="sameuser", email="email1@test.com")
        res = register_user(client, username="sameuser", email="email2@test.com")
        assert res.status_code == 400
        assert "username" in res.json()["detail"].lower()

    def test_register_missing_fields(self, client):
        res = client.post("/auth/register", json={"username": "incomplete"})
        assert res.status_code == 422    # Pydantic validation error

    def test_register_short_password(self, client):
        res = register_user(client, username="shortpw1",
                            email="shortpw@test.com")
        # Override with short password
        res = client.post("/auth/register", json={
            "full_name": "Test", "email": "short@t.com",
            "username": "shortpw_u", "password": "123",   # < 6 chars
            "is_caregiver": False
        })
        assert res.status_code == 422

    def test_register_invalid_email(self, client):
        res = client.post("/auth/register", json={
            "full_name": "Test", "email": "not-an-email",
            "username": "bademail1", "password": "test123",
            "is_caregiver": False
        })
        assert res.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        register_user(client, username="loginuser1", email="login1@test.com")
        res = client.post("/auth/login", json={
            "username": "loginuser1", "password": "test123"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "loginuser1"

    def test_login_wrong_password(self, client):
        register_user(client, username="wrongpw1", email="wrongpw1@test.com")
        res = client.post("/auth/login", json={
            "username": "wrongpw1", "password": "wrongpassword"
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, client):
        res = client.post("/auth/login", json={
            "username": "doesnotexist", "password": "test123"
        })
        assert res.status_code == 401

    def test_login_returns_jwt(self, client):
        register_user(client, username="jwtuser1", email="jwt1@test.com")
        token = login_user(client, username="jwtuser1")
        assert token is not None
        # JWT has 3 parts separated by dots
        assert len(token.split(".")) == 3


class TestMe:
    def test_get_me_authenticated(self, client, user_token):
        res = client.get("/auth/me", headers=auth_headers(user_token))
        assert res.status_code == 200
        assert res.json()["username"] == "stduser1"

    def test_get_me_no_token(self, client):
        res = client.get("/auth/me")
        assert res.status_code == 401

    def test_get_me_invalid_token(self, client):
        res = client.get("/auth/me",
                         headers={"Authorization": "Bearer invalidtoken"})
        assert res.status_code == 401
