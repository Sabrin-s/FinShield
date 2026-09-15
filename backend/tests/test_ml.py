import pytest
from app.ml.anomaly_detector import anomaly_detector
from app.ml.rules_engine import rules_engine
from app.ml.explainability import explainability_engine

def test_anomaly_detector():
    transactions = [
        {"transaction_id": "T1", "amount": 120.0, "velocity_count": 1.0},
        {"transaction_id": "T2", "amount": 9500.0, "velocity_count": 5.0},
        {"transaction_id": "T3", "amount": 45000.0, "velocity_count": 8.0}
    ]
    scored = anomaly_detector.detect_anomalies(transactions, customer_avg_amount=300.0)
    assert len(scored) == 3
    # The $45,000 transaction should have high anomaly score
    assert scored[2]["anomaly_score"] >= 70.0
    assert scored[2]["is_anomaly"] == True

def test_rules_engine_structuring():
    structuring_txs = [
        {"transaction_id": "T1", "amount": 9500.0},
        {"transaction_id": "T2", "amount": 9800.0},
        {"transaction_id": "T3", "amount": 9200.0}
    ]
    res = rules_engine.evaluate_structuring(structuring_txs)
    assert res["triggered"] == True
    assert res["severity"] == "HIGH"
    assert res["match_count"] == 3

def test_explainability_scoring():
    factors = explainability_engine.compute_risk_factors(
        anomaly_scores=[85.0, 92.0],
        triggered_rules=[{"rule_id": "RULE-AML-01", "severity": "HIGH"}],
        kyc_profile={"pep_status": True, "shell_company_risk": 0.8},
        sanctions_matched=False,
        graph_metrics={"has_circular_flow": True, "is_mule_hub": False}
    )
    assert factors["overall_risk_score"] > 60.0
    assert len(factors["factor_breakdown"]) == 4
    assert factors["risk_tier"] in ["HIGH_RISK", "CRITICAL_SUSPICION"]
