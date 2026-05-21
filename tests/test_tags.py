"""
Tests for NFC Tag routes:
  POST   /tags/create    (caregiver only)
  GET    /tags/{tag_id}  (public)
  PUT    /tags/{tag_id}  (owner caregiver only)
  DELETE /tags/{tag_id}  (owner caregiver only)
  GET    /tags/my        (any authenticated user)
"""
import pytest
from tests.conftest import register_user, login_user, auth_headers


def create_tag(client, token, description="This is the kitchen door."):
    return client.post(
        "/tags/create",
        json={"description": description},
        headers=auth_headers(token),
    )


class TestCreateTag:
    def test_caregiver_can_create_tag(self, client, caregiver_token):
        res = create_tag(client, caregiver_token)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        assert len(data["id"]) == 8             # 8-char alphanumeric ID
        assert data["description"] == "This is the kitchen door."

    def test_standard_user_cannot_create_tag(self, client, user_token):
        res = create_tag(client, user_token)
        assert res.status_code == 403
        assert "caregiver" in res.json()["detail"].lower()

    def test_unauthenticated_cannot_create_tag(self, client):
        res = client.post("/tags/create",
                          json={"description": "No auth"})
        assert res.status_code == 401

    def test_tag_id_is_unique(self, client, caregiver_token):
        ids = set()
        for i in range(5):
            res = create_tag(client, caregiver_token,
                             description=f"Tag number {i}")
            assert res.status_code == 201
            ids.add(res.json()["id"])
        assert len(ids) == 5    # all IDs must be unique

    def test_empty_description_rejected(self, client, caregiver_token):
        res = client.post("/tags/create", json={"description": ""},
                          headers=auth_headers(caregiver_token))
        assert res.status_code == 422

    def test_description_too_long_rejected(self, client, caregiver_token):
        res = client.post("/tags/create",
                          json={"description": "x" * 2001},
                          headers=auth_headers(caregiver_token))
        assert res.status_code == 422


class TestReadTag:
    def test_public_can_read_tag(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token,
                            "Front door — turn handle right.").json()["id"]
        res = client.get(f"/tags/{tag_id}")   # no auth header
        assert res.status_code == 200
        assert res.json()["description"] == "Front door — turn handle right."
        assert res.json()["id"] == tag_id

    def test_public_response_hides_owner(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token).json()["id"]
        res = client.get(f"/tags/{tag_id}")
        data = res.json()
        assert "owner_id" not in data    # TagPublic schema hides owner

    def test_unknown_tag_returns_404(self, client):
        res = client.get("/tags/NOTEXIST")
        assert res.status_code == 404


class TestUpdateTag:
    def test_owner_can_update_description(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token,
                            "Old description").json()["id"]
        res = client.put(
            f"/tags/{tag_id}",
            json={"description": "New updated description"},
            headers=auth_headers(caregiver_token),
        )
        assert res.status_code == 200
        assert res.json()["description"] == "New updated description"

    def test_different_caregiver_cannot_update(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token).json()["id"]

        # Register and login a second caregiver
        register_user(client, username="cg_other1",
                      email="cg_other1@test.com", is_caregiver=True)
        other_token = login_user(client, username="cg_other1")

        res = client.put(
            f"/tags/{tag_id}",
            json={"description": "Attempted hijack"},
            headers=auth_headers(other_token),
        )
        assert res.status_code == 403

    def test_standard_user_cannot_update(self, client, caregiver_token, user_token):
        tag_id = create_tag(client, caregiver_token).json()["id"]
        res = client.put(
            f"/tags/{tag_id}",
            json={"description": "Attempt"},
            headers=auth_headers(user_token),
        )
        assert res.status_code == 403


class TestDeleteTag:
    def test_owner_can_delete_tag(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token,
                            "To be deleted").json()["id"]
        res = client.delete(f"/tags/{tag_id}",
                            headers=auth_headers(caregiver_token))
        assert res.status_code == 204
        # Confirm gone
        assert client.get(f"/tags/{tag_id}").status_code == 404

    def test_different_caregiver_cannot_delete(self, client, caregiver_token):
        tag_id = create_tag(client, caregiver_token).json()["id"]
        register_user(client, username="cg_del1",
                      email="cg_del1@test.com", is_caregiver=True)
        other_token = login_user(client, username="cg_del1")
        res = client.delete(f"/tags/{tag_id}",
                            headers=auth_headers(other_token))
        assert res.status_code == 403


class TestMyTags:
    def test_caregiver_sees_own_tags_only(self, client, caregiver_token):
        create_tag(client, caregiver_token, "My tag 1")
        create_tag(client, caregiver_token, "My tag 2")

        # Second caregiver creates their own tag
        register_user(client, username="cg_my1",
                      email="cg_my1@test.com", is_caregiver=True)
        other = login_user(client, username="cg_my1")
        create_tag(client, other, "Other caregiver tag")

        res = client.get("/tags/my", headers=auth_headers(caregiver_token))
        assert res.status_code == 200
        descriptions = [t["description"] for t in res.json()]
        assert "Other caregiver tag" not in descriptions

    def test_unauthenticated_cannot_list_tags(self, client):
        res = client.get("/tags/my")
        assert res.status_code == 401
