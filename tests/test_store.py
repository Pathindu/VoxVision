"""
Tests for Store routes:
  POST /orders/create       (auth required)
  GET  /orders/my           (auth required)
  POST /donations/create    (public)
  POST /payments/webhook    (public — PayHere callback)
"""
import hashlib
import pytest
from tests.conftest import register_user, login_user, auth_headers

MERCHANT_SECRET = "test_merchant_secret"

# ── Helpers ───────────────────────────────────────────────────────────────

def make_md5sig(merchant_id, order_id, amount, currency, status_code, secret):
    secret_hash = hashlib.md5(secret.encode()).hexdigest().upper()
    raw = f"{merchant_id}{order_id}{amount}{currency}{status_code}{secret_hash}"
    return hashlib.md5(raw.encode()).hexdigest()


def create_order(client, token, product="VoxVision NFC Tag Pack (10 stickers)",
                 quantity=2, unit_price=350.00,
                 address="123 Main St, Colombo 03"):
    return client.post("/orders/create", json={
        "product_name":     product,
        "quantity":         quantity,
        "unit_price":       unit_price,
        "shipping_address": address,
    }, headers=auth_headers(token))


def create_donation(client, name="Nimal Perera",
                    email="nimal@test.com", amount=500.0,
                    message="Keep up the great work!"):
    return client.post("/donations/create", json={
        "donor_name":  name,
        "donor_email": email,
        "amount":      amount,
        "message":     message,
    })


# ── Orders ────────────────────────────────────────────────────────────────

class TestCreateOrder:
    def test_authenticated_user_can_place_order(self, client, user_token):
        res = create_order(client, user_token)
        assert res.status_code == 201
        data = res.json()
        assert data["product_name"] == "VoxVision NFC Tag Pack (10 stickers)"
        assert data["quantity"] == 2
        assert data["unit_price"] == 350.0
        assert data["total_amount"] == 700.0      # 2 × 350
        assert data["status"] == "pending"

    def test_total_amount_computed_correctly(self, client, user_token):
        res = create_order(client, user_token, quantity=5, unit_price=800.0)
        assert res.json()["total_amount"] == 4000.0

    def test_unauthenticated_cannot_place_order(self, client):
        res = client.post("/orders/create", json={
            "product_name": "Test", "quantity": 1,
            "unit_price": 350.0, "shipping_address": "123 Test St"
        })
        assert res.status_code == 401

    def test_quantity_zero_rejected(self, client, user_token):
        res = client.post("/orders/create", json={
            "product_name": "Test", "quantity": 0,
            "unit_price": 350.0,
            "shipping_address": "123 Test St, Colombo"
        }, headers=auth_headers(user_token))
        assert res.status_code == 422

    def test_negative_price_rejected(self, client, user_token):
        res = client.post("/orders/create", json={
            "product_name": "Test", "quantity": 1,
            "unit_price": -50.0,
            "shipping_address": "123 Test St, Colombo"
        }, headers=auth_headers(user_token))
        assert res.status_code == 422

    def test_empty_address_rejected(self, client, user_token):
        res = client.post("/orders/create", json={
            "product_name": "Test", "quantity": 1,
            "unit_price": 350.0, "shipping_address": "short"
        }, headers=auth_headers(user_token))
        assert res.status_code == 422


class TestMyOrders:
    def test_user_sees_own_orders_only(self, client, user_token):
        create_order(client, user_token)
        create_order(client, user_token, product="Pack 2")

        # Second user places their own order
        register_user(client, username="buyer2",
                      email="buyer2@test.com", is_caregiver=False)
        other_token = login_user(client, username="buyer2")
        create_order(client, other_token, product="Other user product")

        res = client.get("/orders/my", headers=auth_headers(user_token))
        assert res.status_code == 200
        products = [o["product_name"] for o in res.json()]
        assert "Other user product" not in products

    def test_unauthenticated_cannot_list_orders(self, client):
        assert client.get("/orders/my").status_code == 401


# ── Donations ─────────────────────────────────────────────────────────────

class TestCreateDonation:
    def test_public_user_can_donate(self, client):
        res = create_donation(client)
        assert res.status_code == 201
        data = res.json()
        assert data["donor_name"] == "Nimal Perera"
        assert data["amount"] == 500.0
        assert data["status"] == "pending"

    def test_donation_without_message(self, client):
        res = client.post("/donations/create", json={
            "donor_name": "Anonymous", "donor_email": "anon@test.com",
            "amount": 250.0
        })
        assert res.status_code == 201
        assert res.json()["message"] is None

    def test_zero_amount_rejected(self, client):
        res = client.post("/donations/create", json={
            "donor_name": "Test", "donor_email": "t@t.com", "amount": 0
        })
        assert res.status_code == 422

    def test_negative_amount_rejected(self, client):
        res = client.post("/donations/create", json={
            "donor_name": "Test", "donor_email": "t@t.com", "amount": -100
        })
        assert res.status_code == 422

    def test_invalid_email_rejected(self, client):
        res = client.post("/donations/create", json={
            "donor_name": "Test", "donor_email": "not-email", "amount": 100
        })
        assert res.status_code == 422


# ── PayHere Webhook ────────────────────────────────────────────────────────

class TestPayhereWebhook:
    """
    PayHere sends hidden form POST to /payments/webhook.
    status_code=2 means successful payment.
    """

    def _send_webhook(self, client, order_id, custom_1, custom_2,
                      status_code="2", amount="700.00",
                      merchant_id="1230213", currency="LKR",
                      secret=None):
        if secret is None:
            # No secret configured in test env → signature check skipped
            md5sig = "test_sig"
        else:
            md5sig = make_md5sig(merchant_id, order_id,
                                 amount, currency, status_code, secret)
        return client.post("/payments/webhook", data={
            "merchant_id":      merchant_id,
            "order_id":         order_id,
            "payment_id":       f"PAY-{order_id[:8]}",
            "payhere_amount":   amount,
            "payhere_currency": currency,
            "status_code":      status_code,
            "md5sig":           md5sig,
            "custom_1":         custom_1,
            "custom_2":         custom_2,
        })

    def test_webhook_marks_order_as_paid(self, client, user_token):
        order = create_order(client, user_token).json()
        res = self._send_webhook(
            client,
            order_id=order["id"],
            custom_1="order",
            custom_2=order["id"],
            amount=str(order["total_amount"]),
        )
        assert res.status_code == 200

        # Verify status updated in DB
        orders = client.get("/orders/my",
                            headers=auth_headers(user_token)).json()
        updated = next(o for o in orders if o["id"] == order["id"])
        assert updated["status"] == "paid"

    def test_webhook_marks_donation_as_paid(self, client):
        donation = create_donation(client).json()
        res = self._send_webhook(
            client,
            order_id=donation["id"],
            custom_1="donation",
            custom_2=donation["id"],
            amount=str(donation["amount"]),
        )
        assert res.status_code == 200

    def test_cancelled_payment_not_marked_paid(self, client, user_token):
        order = create_order(client, user_token).json()
        # status_code=-1 means cancelled
        res = self._send_webhook(
            client,
            order_id=order["id"],
            custom_1="order",
            custom_2=order["id"],
            status_code="-1",
        )
        assert res.status_code == 200
        orders = client.get("/orders/my",
                            headers=auth_headers(user_token)).json()
        updated = next(o for o in orders if o["id"] == order["id"])
        assert updated["status"] == "pending"   # NOT changed

    def test_failed_payment_not_marked_paid(self, client, user_token):
        order = create_order(client, user_token).json()
        self._send_webhook(client, order_id=order["id"],
                           custom_1="order", custom_2=order["id"],
                           status_code="-2")
        orders = client.get("/orders/my",
                            headers=auth_headers(user_token)).json()
        updated = next(o for o in orders if o["id"] == order["id"])
        assert updated["status"] == "pending"

    def test_webhook_unknown_order_id_graceful(self, client):
        res = self._send_webhook(
            client,
            order_id="nonexistent-uuid-9999",
            custom_1="order",
            custom_2="nonexistent-uuid-9999",
        )
        # Should not crash — just process silently
        assert res.status_code == 200


# ── PayHere Sandbox Manual Test Checklist ─────────────────────────────────
# Run these manually via the browser UI (cannot be automated):
#
#  SCENARIO                    TEST DATA                        EXPECTED
#  ─────────────────────────── ──────────────────────────────── ─────────────────────
#  Successful order payment    Card: 4111 1111 1111 1111        Redirect to /store?payment=success
#                              Exp: any future date             Order status → paid in DB
#                              CVV: any 3 digits
#
#  Successful donation         Same card details                Redirect to /store?payment=success
#                              Amount: LKR 500                  Donation status → paid in DB
#
#  Payment cancelled by user   Click Cancel on PayHere page     Redirect to /store?payment=cancelled
#                                                               Order status stays → pending
#
#  Invalid card number         Card: 4111 1111 1111 0000        PayHere shows error
#                                                               Order status stays → pending
#
#  Wrong merchant ID           Edit REACT_APP_PAYHERE_MERCHANT_ID PayHere error 440621052647
#
#  Domain not whitelisted      Remove domain from PayHere       PayHere error 440621052647
#                              Integrations panel               Add domain to fix
