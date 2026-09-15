from typing import Dict, Any, List

class ExplainabilityEngine:
    """
    Computes explainable risk attribution breakdowns and transparent factor scoring.
    """

    @staticmethod
    def compute_risk_factors(
        anomaly_scores: List[float],
        triggered_rules: List[Dict[str, Any]],
        kyc_profile: Dict[str, Any],
        sanctions_matched: bool,
        graph_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Decomposes total AML risk score into individual factor weights and percentage contributions.
        """
        # 1. Anomaly Model Factor (0 - 25 pts)
        max_anomaly = max(anomaly_scores) if anomaly_scores else 0.0
        anomaly_factor = min(25.0, (max_anomaly / 100.0) * 25.0)

        # 2. Rule Triggers Factor (0 - 25 pts)
        rule_score = 0.0
        for rule in triggered_rules:
            sev = rule.get("severity", "LOW")
            if sev == "CRITICAL":
                rule_score += 15.0
            elif sev == "HIGH":
                rule_score += 10.0
            elif sev == "MEDIUM":
                rule_score += 5.0
        rule_factor = min(25.0, rule_score)

        # 3. Sanctions / PEP / Adverse Media Factor (0 - 25 pts)
        sanctions_score = 0.0
        if sanctions_matched:
            sanctions_score += 25.0
        if kyc_profile.get("pep_status", False):
            sanctions_score += 10.0
        if kyc_profile.get("adverse_media_flag", False):
            sanctions_score += 8.0
        if kyc_profile.get("jurisdiction_risk") in ["HIGH", "SANCTIONED"]:
            sanctions_score += 8.0
        sanctions_factor = min(25.0, sanctions_score)

        # 4. Graph Topology & Shell Risk Factor (0 - 25 pts)
        graph_score = 0.0
        if graph_metrics.get("has_circular_flow", False):
            graph_score += 15.0
        if graph_metrics.get("is_mule_hub", False):
            graph_score += 12.0
        if graph_metrics.get("max_hops", 0) >= 3:
            graph_score += 5.0
        shell_risk = float(kyc_profile.get("shell_company_risk", 0.0))
        graph_score += shell_risk * 10.0
        graph_factor = min(25.0, graph_score)

        # Composite score
        total_risk_score = round(anomaly_factor + rule_factor + sanctions_factor + graph_factor, 1)
        total_risk_score = min(100.0, max(0.0, total_risk_score))

        # Attributions dictionary for waterfall and radar charts
        factor_breakdown = [
            {
                "category": "Machine Learning Anomaly",
                "score": round(anomaly_factor, 1),
                "max_score": 25.0,
                "percentage": round((anomaly_factor / 25.0) * 100, 1),
                "impact": "HIGH" if anomaly_factor > 15 else "MEDIUM" if anomaly_factor > 5 else "LOW",
                "evidence": f"Peak IsolationForest anomaly score: {round(max_anomaly, 1)}/100"
            },
            {
                "category": "Heuristic Rule Violations",
                "score": round(rule_factor, 1),
                "max_score": 25.0,
                "percentage": round((rule_factor / 25.0) * 100, 1),
                "impact": "HIGH" if rule_factor > 15 else "MEDIUM" if rule_factor > 5 else "LOW",
                "evidence": f"{len(triggered_rules)} deterministic AML rule(s) triggered"
            },
            {
                "category": "Entity KYC & Sanctions Exposure",
                "score": round(sanctions_factor, 1),
                "max_score": 25.0,
                "percentage": round((sanctions_factor / 25.0) * 100, 1),
                "impact": "HIGH" if sanctions_factor > 15 else "MEDIUM" if sanctions_factor > 5 else "LOW",
                "evidence": "OFAC SDN match" if sanctions_matched else f"PEP: {kyc_profile.get('pep_status')}, Jurisdiction: {kyc_profile.get('jurisdiction_risk')}"
            },
            {
                "category": "Graph Topology & Layering Complexity",
                "score": round(graph_factor, 1),
                "max_score": 25.0,
                "percentage": round((graph_factor / 25.0) * 100, 1),
                "impact": "HIGH" if graph_factor > 15 else "MEDIUM" if graph_factor > 5 else "LOW",
                "evidence": "Circular cycle detected" if graph_metrics.get("has_circular_flow") else f"Shell risk: {int(shell_risk*100)}%"
            }
        ]

        # Determine overall classification tier
        if total_risk_score >= 80:
            tier = "CRITICAL_SUSPICION"
            recommendation = "IMMEDIATE_SAR_FILING"
        elif total_risk_score >= 60:
            tier = "HIGH_RISK"
            recommendation = "ENHANCED_DUE_DILIGENCE_AND_SAR_REVIEW"
        elif total_risk_score >= 35:
            tier = "MEDIUM_RISK"
            recommendation = "TRANSACTION_MONITORING_HOLD"
        else:
            tier = "LOW_RISK"
            recommendation = "CLEAR_FALSE_POSITIVE"

        return {
            "overall_risk_score": total_risk_score,
            "risk_tier": tier,
            "recommendation": recommendation,
            "confidence_score": round(0.88 + (total_risk_score / 1000.0), 2),
            "factor_breakdown": factor_breakdown
        }

explainability_engine = ExplainabilityEngine()
