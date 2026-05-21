# VoxVision — PayHere Sandbox Manual Testing Guide

## Setup Before Testing

1. Make sure both servers are running:
   ```
   # Backend
   cd backend
   py -m uvicorn app.main:app --reload --port 8000

   # Frontend  
   cd frontend
   npm start
   ```

2. Make sure your `frontend/.env` has:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_PAYHERE_MERCHANT_ID=your_app_id_here
   ```

3. Make sure your PayHere sandbox domain includes `localhost` or `127.0.0.1`
   → sandbox.payhere.lk → Integrations → API Keys

---

## PayHere Sandbox Test Cards

| Card Number          | Result       |
|----------------------|--------------|
| 4111 1111 1111 1111  | ✅ SUCCESS   |
| 5431 1111 1111 1111  | ✅ SUCCESS (Mastercard) |
| 4111 1111 1111 0000  | ❌ FAILED    |

**Use for all tests:**
- Expiry: any future date (e.g. 12/26)
- CVV: any 3 digits (e.g. 123)
- OTP (if asked): 123456

---

## Test Scenarios

### TEST 1 — Successful Order Payment

**Steps:**
1. Go to `http://localhost:3000/login` → Login as a registered user
2. Go to `http://localhost:3000/store`
3. Select **VoxVision NFC Tag Pack (10 stickers)**
4. Set Quantity: **2**
5. Enter Phone: `0771234567`
6. Enter Address: `No 1 Main Street, Colombo 03`
7. Click **💳 Pay with PayHere**

**Expected:**
- Browser redirects to `https://sandbox.payhere.lk/pay/checkout`
- PayHere checkout page shows **VoxVision NFC Tag Pack (10 stickers)** — LKR 700.00
- Enter card: `4111 1111 1111 1111` → any expiry → any CVV
- Click Pay
- Browser redirects back to `http://localhost:3000/store?payment=success`
- Green banner: **"🎉 Payment successful! Your order has been confirmed."**

**Verify in pgAdmin:**
```sql
SELECT id, status, payhere_order_id FROM orders ORDER BY created_at DESC LIMIT 1;
```
→ status should be **paid**, payhere_order_id should be filled

---

### TEST 2 — Successful Donation

**Steps:**
1. Go to `http://localhost:3000/store`
2. Click **❤️ Donate** tab
3. Enter Name: `Nimal Perera`
4. Enter Email: `nimal@test.com`
5. Enter Phone: `0771234567`
6. Click quick amount button **1,000**
7. Enter message: `Keep up the great work!`
8. Click **❤️ Donate with PayHere**

**Expected:**
- Redirects to PayHere sandbox
- Amount shows LKR 1,000.00 — Item: VoxVision Donation
- Pay with test card
- Redirects to `/store?payment=success`

**Verify in pgAdmin:**
```sql
SELECT id, status, amount, payhere_order_id FROM donations ORDER BY created_at DESC LIMIT 1;
```
→ status should be **paid**

---

### TEST 3 — Payment Cancellation

**Steps:**
1. Place an order (same as Test 1)
2. On PayHere checkout page — click **Cancel** or **Go Back**

**Expected:**
- Browser redirects to `http://localhost:3000/store?payment=cancelled`
- Yellow banner: **"⚠️ Payment was cancelled. Your order is saved — try again anytime."**

**Verify in pgAdmin:**
```sql
SELECT status FROM orders ORDER BY created_at DESC LIMIT 1;
```
→ status should still be **pending** (NOT changed)

---

### TEST 4 — Failed Payment (Invalid Card)

**Steps:**
1. Place an order
2. On PayHere checkout — use card `4111 1111 1111 0000`
3. Click Pay

**Expected:**
- PayHere shows payment failed error
- Order status stays **pending** in DB

---

### TEST 5 — Wrong Merchant ID

**Steps:**
1. Temporarily change `frontend/.env`:
   ```
   REACT_APP_PAYHERE_MERCHANT_ID=9999999
   ```
2. Restart frontend (`npm start`)
3. Try to place an order

**Expected:**
- PayHere shows **error 440621052647** (invalid merchant)

**Fix:** Revert the merchant ID to the correct one

---

### TEST 6 — Domain Not Whitelisted

**Steps:**
1. In PayHere sandbox → Integrations → delete the `localhost` API key
2. Try to place an order

**Expected:**
- PayHere shows **error 440621052647**

**Fix:** Re-add `localhost` in PayHere Integrations

---

### TEST 7 — Webhook Verification (Advanced)

To test the webhook is being called by PayHere:

1. Use **ngrok** to expose your local backend:
   ```
   ngrok http 8000
   ```
2. Update `frontend/.env`:
   ```
   REACT_APP_API_URL=https://xxxx.ngrok.io
   ```
3. Place an order and complete payment
4. Check ngrok dashboard for the webhook POST request to `/payments/webhook`
5. Check backend terminal for the log

---

## Verify All Tests Pass

| # | Test Scenario           | Expected Result                        | Status |
|---|-------------------------|----------------------------------------|--------|
| 1 | Successful order payment | Redirect success, DB status=paid       | ☐      |
| 2 | Successful donation      | Redirect success, DB status=paid       | ☐      |
| 3 | Payment cancelled        | Redirect cancelled, DB status=pending  | ☐      |
| 4 | Failed card              | PayHere error, DB status=pending       | ☐      |
| 5 | Wrong merchant ID        | Error 440621052647                     | ☐      |
| 6 | Domain not whitelisted   | Error 440621052647                     | ☐      |
| 7 | Webhook called correctly | POST visible in ngrok dashboard        | ☐      |
