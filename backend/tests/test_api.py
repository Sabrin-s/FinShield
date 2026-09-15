import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine
from app.data.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_get_alerts():
    response = client.get("/api/v1/alerts/")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 5

def test_get_metrics():
    response = client.get("/api/v1/metrics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_alerts"] >= 5

def test_run_investigation_endpoint():
    response = client.post("/api/v1/investigation/run", json={"alert_id": "ALT-2026-8801"})
    assert response.status_code == 200
    state = response.json()
    assert state["overall_status"] == "COMPLETED"
    assert "sar_draft" in state
