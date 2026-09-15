from typing import List, Dict, Any
from datetime import datetime, timedelta

HIGH_RISK_COUNTRIES = {"IR", "KP", "RU", "SY", "MM", "CU", "VG", "KY", "PA", "CY", "AE"}

class AMLRulesEngine:
    """
    Deterministic rule-based AML heuristic engine reflecting FinCEN & FATF red flag triggers.
    """
    
    @staticmethod
    def evaluate_structuring(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detects transactions structured just below the $10,000 currency reporting limit.
        """
        structuring_txs = []
        for tx in transactions:
            amount = float(tx.get("amount", 0.0))
            if 8000.0 <= amount < 10000.0:
                structuring_txs.append(tx)
        
        triggered = len(structuring_txs) >= 2
        return {
            "rule_id": "RULE-AML-01",
            "rule_name": "Structuring & Smurfing Detection",
            "triggered": triggered,
            "severity": "HIGH" if triggered else "NONE",
            "match_count": len(structuring_txs),
            "matched_transactions": [tx.get("transaction_id") for tx in structuring_txs],
            "description": f"Detected {len(structuring_txs)} transactions between $8,000 and $9,999 structured beneath CTR threshold."
        }

    @staticmethod
    def evaluate_velocity(transactions: List[Dict[str, Any]], window_hours: int = 24) -> Dict[str, Any]:
        """
        Detects rapid bursts in transaction count and sudden velocity spikes.
        """
        sorted_txs = sorted(transactions, key=lambda x: x.get("timestamp", datetime.utcnow()))
        max_burst_count = 0
        burst_tx_ids = []

        for i, tx1 in enumerate(sorted_txs):
            t1 = tx1.get("timestamp")
            if not isinstance(t1, datetime):
                continue
            current_burst = [tx1.get("transaction_id")]
            for tx2 in sorted_txs[i+1:]:
                t2 = tx2.get("timestamp")
                if not isinstance(t2, datetime):
                    continue
                if (t2 - t1).total_seconds() <= window_hours * 3600:
                    current_burst.append(tx2.get("transaction_id"))
                else:
                    break
            if len(current_burst) > max_burst_count:
                max_burst_count = len(current_burst)
                burst_tx_ids = current_burst

        triggered = max_burst_count >= 4
        return {
            "rule_id": "RULE-AML-02",
            "rule_name": "Rapid Transaction Velocity Burst",
            "triggered": triggered,
            "severity": "MEDIUM" if max_burst_count >= 4 else "NONE",
            "max_window_count": max_burst_count,
            "matched_transactions": burst_tx_ids,
            "description": f"Observed burst of {max_burst_count} transactions within a {window_hours}-hour observation window."
        }

    @staticmethod
    def evaluate_high_risk_jurisdictions(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detects fund movement through sanctioned or high-risk secrecy jurisdictions.
        """
        high_risk_matches = []
        for tx in transactions:
            src = tx.get("country_source", "US").upper()
            dest = tx.get("country_dest", "US").upper()
            if src in HIGH_RISK_COUNTRIES or dest in HIGH_RISK_COUNTRIES:
                high_risk_matches.append({
                    "tx_id": tx.get("transaction_id"),
                    "amount": tx.get("amount"),
                    "flow": f"{src} -> {dest}"
                })

        triggered = len(high_risk_matches) > 0
        return {
            "rule_id": "RULE-AML-03",
            "rule_name": "High-Risk & Sanctioned Jurisdiction Nexus",
            "triggered": triggered,
            "severity": "CRITICAL" if triggered else "NONE",
            "match_count": len(high_risk_matches),
            "matched_details": high_risk_matches,
            "description": f"Identified {len(high_risk_matches)} transactions originating from or terminating in high-risk jurisdictions."
        }

    @staticmethod
    def evaluate_pass_through_ratio(inflows: float, outflows: float, time_diff_hours: float) -> Dict[str, Any]:
        """
        Detects pass-through / funnel behavior where funds are drained immediately.
        """
        if inflows <= 0:
            return {"rule_id": "RULE-AML-04", "triggered": False, "severity": "NONE", "description": "No inflows to evaluate"}
        
        ratio = outflows / inflows
        triggered = ratio >= 0.85 and time_diff_hours <= 48.0 and inflows >= 15000.0
        return {
            "rule_id": "RULE-AML-04",
            "rule_name": "Rapid Pass-Through & Funnel Depletion",
            "triggered": triggered,
            "severity": "HIGH" if triggered else "NONE",
            "ratio": round(ratio, 3),
            "description": f"Pass-through ratio of {round(ratio*100, 1)}% within {round(time_diff_hours, 1)} hours ($ {inflows:,.2f} in / $ {outflows:,.2f} out)."
        }

    def run_all_rules(self, transactions: List[Dict[str, Any]], inflows: float = 0.0, outflows: float = 0.0) -> List[Dict[str, Any]]:
        results = [
            self.evaluate_structuring(transactions),
            self.evaluate_velocity(transactions),
            self.evaluate_high_risk_jurisdictions(transactions),
            self.evaluate_pass_through_ratio(inflows, outflows, 24.0)
        ]
        return [r for r in results if r["triggered"]]

rules_engine = AMLRulesEngine()
