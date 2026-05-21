# VoxVision — Complete Testing Guide

## File Structure

```
tests/
├── backend/
│   ├── tests/
│   │   ├── conftest.py          ← Shared fixtures, in-memory SQLite DB
│   │   ├── test_auth.py         ← Register, Login, JWT tests
│   │   ├── test_tags.py         ← NFC Tag CRUD + access control
│   │   └── test_store.py        ← Orders, Donations, PayHere webhook
│   ├── pytest.ini
│   └── requirements-test.txt
│
├── frontend/
│   └── src/__tests__/
│       ├── Auth.test.js         ← LoginRegister component tests
│       ├── Store.test.js        ← Store + PayHere redirect tests
│       └── Tags.test.js         ← TagWriter + TagScanner tests
│
└── PAYHERE_TESTING_GUIDE.md     ← Manual PayHere sandbox test steps
```

---

## Where to put these files in your project

```
backend/
├── tests/                  ← Copy conftest.py, test_auth.py, test_tags.py, test_store.py here
├── pytest.ini              ← Copy here
└── requirements-test.txt   ← Copy here

frontend/
└── src/
    └── __tests__/          ← Create this folder, copy Auth.test.js, Store.test.js, Tags.test.js here

PAYHERE_TESTING_GUIDE.md    ← Keep in project root
```

---

## Running Backend Tests

### Install test dependencies
```powershell
cd backend
pip install -r requirements-test.txt
```

### Run all tests
```powershell
cd backend
pytest
```

### Run a specific test file
```powershell
pytest tests/test_auth.py
pytest tests/test_tags.py
pytest tests/test_store.py
```

### Run a specific test
```powershell
pytest tests/test_auth.py::TestLogin::test_login_success
```

### Run with coverage report
```powershell
pip install pytest-cov
pytest --cov=app --cov-report=term-missing
```

**Expected output:**
```
tests/test_auth.py::TestRegister::test_register_standard_user    PASSED
tests/test_auth.py::TestRegister::test_register_caregiver        PASSED
tests/test_auth.py::TestRegister::test_register_duplicate_email  PASSED
...
========================= 35 passed in 3.42s =========================
```

---

## Running Frontend Tests

```powershell
cd frontend
npm test
```

Press `a` to run all tests.

**Expected output:**
```
PASS src/__tests__/Auth.test.js
PASS src/__tests__/Store.test.js
PASS src/__tests__/Tags.test.js

Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
```

---

## Manual PayHere Testing

See **PAYHERE_TESTING_GUIDE.md** for step-by-step instructions.

**PayHere test card:** `4111 1111 1111 1111` — any future expiry — any CVV

---

## Test Coverage Summary

| Area                  | Tests | Type         |
|-----------------------|-------|--------------|
| User Registration     | 7     | Automated    |
| User Login / JWT      | 5     | Automated    |
| Auth /me endpoint     | 3     | Automated    |
| NFC Tag Create        | 6     | Automated    |
| NFC Tag Read (public) | 3     | Automated    |
| NFC Tag Update        | 3     | Automated    |
| NFC Tag Delete        | 2     | Automated    |
| My Tags list          | 2     | Automated    |
| Order Create          | 6     | Automated    |
| My Orders             | 2     | Automated    |
| Donation Create       | 5     | Automated    |
| PayHere Webhook       | 5     | Automated    |
| LoginRegister UI      | 7     | Automated    |
| Store UI + PayHere    | 8     | Automated    |
| TagWriter UI          | 6     | Automated    |
| TagScanner UI         | 5     | Automated    |
| PayHere Sandbox       | 7     | Manual       |
| **TOTAL**             | **82**|              |
