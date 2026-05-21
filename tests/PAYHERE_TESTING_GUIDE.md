# VoxVision — PayHere Sandbox Manual Testing Guide

## What is PayHere Sandbox?

PayHere Sandbox (`sandbox.payhere.lk`) is a **completely separate test environment** — a clone
of the live PayHere platform. No real payments are processed. It simulates payments so you can
test your integration before going live.

> ⚠️ Your Sandbox account **cannot** be converted to a Live account.
> When ready for production, sign up separately at payhere.lk/merchant/sign-up

---

## Setup Before Testing

1. Make sure both servers are running:
   ```
   # Terminal 1 — Backend
   cd backend
   py -m uvicorn app.main:app --reload --port 8000

   # Terminal 2 — Frontend
   cd frontend
   npm start
   ```

2. Make sure `frontend/.env` has:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_PAYHERE_MERCHANT_ID=your_app_id_here
   ```

3. Your domain must be whitelisted in PayHere:
   → sandbox.payhere.lk → Integrations → API Keys → add `localhost`

---

## PayHere Sandbox Test Cards

### ✅ Successful Payment Cards

| Card Type  | Card Number          |
|------------|----------------------|
| Visa       | 4916 2175 0161 1292  |
| MasterCard | 5307 7321 2553 1191  |
| AMEX       | 3467 8100 5510 225   |

> For **Name on Card**, **CVV**, and **Expiry Date** — enter any valid data (e.g. expiry 12/26, CVV 123)

---

### ❌ Decline Scenario Cards

**Insufficient Funds:**
| Card Type  | Card Number          |
|------------|----------------------|
| Visa       | 4024 0071 9434 9121  |
| MasterCard | 5459 0514 3377 7487  |
| AMEX       | 3707 8771 1978 928   |

**Limit Exceeded:**
| Card Type  | Card Number          |
|------------|----------------------|
| Visa       | 4929 1197 9936 5646  |
| MasterCard | 5491 1822 4317 8283  |
| AMEX       | 3407 0181 1823 469   |

**Do Not Honor:**
| Card Type  | Card Number          |
|------------|----------------------|
| Visa       | 4929 7689 0083 7248  |
| MasterCard | 5388 1721 3736 7973  |
| AMEX       | 3746 6417 5202 812   |

**Network Error:**
| Card Type  | Card Number          |
|------------|----------------------|
| Visa       | 4024 0071 2086 9333  |
| MasterCard | 5237 9805 6518 5003  |
| AMEX       | 3734 3350 0205 887   |

---

## Test Scenarios

### TEST 1 — Successful Order Payment (Visa)

**Steps:**
1. Go to `http://localhost:3000/login` → Login
2. Go to `http://localhost:3000/store`
3. Select **VoxVision NFC Tag Pack (10 stickers)**
4. Set Quantity: **2**, Phone: `0771234567`
5. Address: `No 1 Main Street, Colombo 03`
6. Click **💳 Pay with PayHere**
7. On PayHere page — use card `4916 2175 0161 1292`, any expiry, any CVV
8. Click Pay

**Expected:**
- Redirects to `/store?payment=success`
- Green banner: **"🎉 Payment successful!"**

**Verify in pgAdmin:**
```sql
SELECT id, status, payhere_order_id FROM orders ORDER BY created_at DESC LIMIT 1;
```
→ `status = paid`, `payhere_order_id` filled in

---

### TEST 2 — Successful Donation (MasterCard)

**Steps:**
1. Go to Store → **❤️ Donate** tab
2. Name: `Nimal Perera`, Email: `nimal@test.com`, Phone: `0771234567`
3. Click quick amount **1,000**
4. Click **❤️ Donate with PayHere**
5. Use card `5307 7321 2553 1191`

**Expected:**
- Redirects to `/store?payment=success`

**Verify:**
```sql
SELECT status, amount FROM donations ORDER BY created_at DESC LIMIT 1;
```
→ `status = paid`

---

### TEST 3 — Payment Cancellation

**Steps:**
1. Place any order → PayHere page opens
2. Click **Cancel** or browser back button

**Expected:**
- Redirects to `/store?payment=cancelled`
- Yellow warning banner shown

**Verify:**
```sql
SELECT status FROM orders ORDER BY created_at DESC LIMIT 1;
```
→ `status = pending` (unchanged)

---

### TEST 4 — Insufficient Funds

**Steps:**
1. Place an order
2. Use card `4024 0071 9434 9121`

**Expected:**
- PayHere shows "Insufficient Funds" error
- Order stays `pending` in DB

---

### TEST 5 — Limit Exceeded

**Steps:**
1. Place an order
2. Use card `4929 1197 9936 5646`

**Expected:**
- PayHere shows "Limit Exceeded" error

---

### TEST 6 — Do Not Honor

**Steps:**
1. Place an order
2. Use card `4929 7689 0083 7248`

**Expected:**
- PayHere shows "Do Not Honor" error

---

### TEST 7 — Network Error

**Steps:**
1. Place an order
2. Use card `4024 0071 2086 9333`

**Expected:**
- PayHere shows "Network Error"

---

### TEST 8 — Wrong Merchant ID

**Steps:**
1. Temporarily change `frontend/.env`:
   ```
   REACT_APP_PAYHERE_MERCHANT_ID=9999999
   ```
2. Restart frontend → try to place order

**Expected:**
- PayHere error **440621052647**

**Fix:** Revert merchant ID, restart frontend

---

### TEST 9 — Domain Not Whitelisted

**Steps:**
1. In PayHere sandbox → Integrations → delete the `localhost` API key
2. Try to place an order

**Expected:**
- PayHere error **440621052647**

**Fix:** Re-add `localhost` in PayHere Integrations

---

## Full Test Checklist

| # | Scenario                  | Card Used                  | Expected Result                    | ✓ |
|---|---------------------------|----------------------------|------------------------------------|---|
| 1 | Successful order (Visa)   | 4916 2175 0161 1292        | Redirect success, DB=paid          | ☐ |
| 2 | Successful donation (MC)  | 5307 7321 2553 1191        | Redirect success, DB=paid          | ☐ |
| 3 | Payment cancelled         | —                          | Redirect cancelled, DB=pending     | ☐ |
| 4 | Insufficient funds        | 4024 0071 9434 9121        | PayHere error, DB=pending          | ☐ |
| 5 | Limit exceeded            | 4929 1197 9936 5646        | PayHere error, DB=pending          | ☐ |
| 6 | Do not honor              | 4929 7689 0083 7248        | PayHere error, DB=pending          | ☐ |
| 7 | Network error             | 4024 0071 2086 9333        | PayHere error, DB=pending          | ☐ |
| 8 | Wrong merchant ID         | —                          | Error 440621052647                 | ☐ |
| 9 | Domain not whitelisted    | —                          | Error 440621052647                 | ☐ |

---

## Going Live

Once all sandbox tests pass:
1. Sign up for a Live account at **payhere.lk/merchant/sign-up**
2. Get your Live Merchant ID and Secret
3. Update Render environment variables:
   ```
   PAYHERE_MERCHANT_ID=your_live_merchant_id
   PAYHERE_MERCHANT_SECRET=your_live_merchant_secret
   ```
4. Update `frontend/.env` or Render frontend environment:
   ```
   REACT_APP_PAYHERE_MERCHANT_ID=your_live_merchant_id
   ```
5. Change PayHere checkout URL in `Store.js` from sandbox to live:
   ```js
   // Change this line:
   form.action = 'https://sandbox.payhere.lk/pay/checkout';
   // To:
   form.action = 'https://www.payhere.lk/pay/checkout';
   ```
