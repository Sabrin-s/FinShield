import pytest
from app.agents.orchestrator import orchestrator
from app.rag.vector_store import typology_store

def test_typology_rag_vector_search():
    results = typology_store.search("smurfing below 10000 CTR reporting threshold", top_k=2)
    assert len(results) > 0
    assert "Smurfing" in results[0]["title"] or "Structuring" in results[0]["title"]

def test_multi_agent_orchestrator_execution():
    customer = {
        "customer_id": "CUST-TEST-01",
        "name": "Apex Test Trade LLC",
        "entity_type": "LLC",
        "pep_status": False,
        "jurisdiction_risk": "MEDIUM",
        "annual_income": 120000.0,
        "shell_company_risk": 0.4
    }
    transactions = [
        {"transaction_id": "TX-1", "source_account": "ACC-EXT-1", "destination_account": "ACC-TEST-99", "amount": 9500.0, "channel": "CASH_DEPOSIT"},
        {"transaction_id": "TX-2", "source_account": "ACC-EXT-2", "destination_account": "ACC-TEST-99", "amount": 9700.0, "channel": "CASH_DEPOSIT"},
        {"transaction_id": "TX-3", "source_account": "ACC-TEST-99", "destination_account": "ACC-OFFSHORE-1", "amount": 19000.0, "channel": "WIRE"}
    ]

    state = orchestrator.run_investigation(
        alert_id="ALT-TEST-01",
        customer_profile=customer,
        account_number="ACC-TEST-99",
        transactions=transactions
    )

    assert state["overall_status"] == "COMPLETED"
    assert len(state["agent_logs"]) == 7  # All 7 agents executed
    assert "sar_draft" in state
    assert state["sar_draft"]["report_id"].startswith("SAR-")
    assert state["risk_assessment"]["overall_risk_score"] > 0
