"""
VoxVision – pytest fixtures shared across all backend tests.
Uses an in-memory SQLite database so no PostgreSQL is needed to run tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import create_app

# ── In-memory SQLite for tests (no Postgres needed) ───────────────────────
TEST_DATABASE_URL = "sqlite:///./test_voxvision.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Create all tables once before the test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Provide a clean DB session per test, rolled back after."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client():
    """FastAPI test client with DB override."""
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


# ── Reusable helpers ──────────────────────────────────────────────────────

def register_user(client, username="testuser", password="test123",
                  email="test@test.com", is_caregiver=False):
    return client.post("/auth/register", json={
        "full_name": "Test User",
        "email": email,
        "username": username,
        "password": password,
        "is_caregiver": is_caregiver,
    })


def login_user(client, username="testuser", password="test123"):
    res = client.post("/auth/login", json={
        "username": username,
        "password": password,
    })
    return res.json().get("access_token")


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def caregiver_token(client):
    register_user(client, username="caregiver1",
                  email="caregiver@test.com", is_caregiver=True)
    return login_user(client, username="caregiver1")


@pytest.fixture()
def user_token(client):
    register_user(client, username="stduser1",
                  email="stduser@test.com", is_caregiver=False)
    return login_user(client, username="stduser1")
