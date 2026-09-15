import pytest
from app.graph.network_analyzer import graph_analyzer

def test_graph_circular_flow_detection():
    # Circular flow: A -> B -> C -> A
    txs = [
        {"transaction_id": "T1", "source_account": "ACC_A", "destination_account": "ACC_B", "amount": 100000.0},
        {"transaction_id": "T2", "source_account": "ACC_B", "destination_account": "ACC_C", "amount": 98000.0},
        {"transaction_id": "T3", "source_account": "ACC_C", "destination_account": "ACC_A", "amount": 95000.0}
    ]
    res = graph_analyzer.analyze(txs, target_account="ACC_A")
    assert res["metrics"]["has_circular_flow"] == True
    assert res["metrics"]["is_target_in_cycle"] == True
    assert len(res["cycles"]) >= 1

def test_graph_mule_fanout_detection():
    # Mule hub: Source sending to 4 mules
    txs = [
        {"transaction_id": "T1", "source_account": "ACC_HUB", "destination_account": "MULE_1", "amount": 25000.0},
        {"transaction_id": "T2", "source_account": "ACC_HUB", "destination_account": "MULE_2", "amount": 25000.0},
        {"transaction_id": "T3", "source_account": "ACC_HUB", "destination_account": "MULE_3", "amount": 25000.0},
        {"transaction_id": "T4", "source_account": "ACC_HUB", "destination_account": "MULE_4", "amount": 25000.0}
    ]
    res = graph_analyzer.analyze(txs, target_account="ACC_HUB")
    assert res["metrics"]["is_mule_hub"] == True
    assert len(res["mule_hubs"]) >= 1
