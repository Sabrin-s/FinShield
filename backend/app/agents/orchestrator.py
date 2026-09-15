import time
import uuid
from datetime import datetime
from typing import Dict, Any, List, Generator
from app.agents.state import InvestigationState
from app.agents.planner_agent import planner_agent
from app.agents.transaction_agent import transaction_agent
from app.agents.kyc_agent import kyc_agent
from app.agents.sanction_agent import sanction_agent
from app.agents.risk_engine_agent import risk_engine_agent
from app.agents.evidence_rag_agent import evidence_rag_agent
from app.agents.sar_generator_agent import sar_generator_agent

class AMLInvestigationOrchestrator:
    """
    Multi-Agent AML Orchestrator. Coordinates specialized agents through the full investigation lifecycle.
    """

    def run_investigation(
        self,
        alert_id: str,
        customer_profile: Dict[str, Any],
        account_number: str,
        transactions: List[Dict[str, Any]],
        case_id: str = None
    ) -> Dict[str, Any]:
        """
        Synchronous full run returning complete investigation state.
        """
        if not case_id:
            case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        state: InvestigationState = {
            "case_id": case_id,
            "alert_id": alert_id,
            "customer_id": customer_profile.get("customer_id", ""),
            "account_number": account_number,
            "customer_profile": customer_profile,
            "accounts": [],
            "transactions": transactions,
            "planner_plan": {},
            "transaction_findings": {},
            "kyc_findings": {},
            "sanction_findings": {},
            "graph_findings": {},
            "risk_assessment": {},
            "rag_evidence": [],
            "sar_draft": {},
            "agent_logs": [],
            "overall_status": "IN_PROGRESS",
            "start_time": datetime.utcnow().isoformat(),
            "end_time": None
        }

        # Step 1: Planner Agent
        p_res = planner_agent.execute(state)
        state["planner_plan"] = p_res["plan"]
        state["agent_logs"].append(p_res["log"])

        # Step 2: Transaction Ledger Agent
        t_res = transaction_agent.execute(state)
        state["transaction_findings"] = t_res["findings"]
        state["agent_logs"].append(t_res["log"])

        # Step 3: KYC & Entity Agent
        k_res = kyc_agent.execute(state)
        state["kyc_findings"] = k_res["findings"]
        state["agent_logs"].append(k_res["log"])

        # Step 4: Sanction & Document Screening Agent
        s_res = sanction_agent.execute(state)
        state["sanction_findings"] = s_res["findings"]
        state["agent_logs"].append(s_res["log"])

        # Step 5: Fraud/AML Risk Engine & Graph Analyzer Agent
        r_res = risk_engine_agent.execute(state)
        state["risk_assessment"] = r_res["risk_assessment"]
        state["graph_findings"] = r_res["graph_findings"]
        state["agent_logs"].append(r_res["log"])

        # Step 6: Evidence & RAG Agent
        e_res = evidence_rag_agent.execute(state)
        state["rag_evidence"] = e_res["rag_evidence"]
        state["agent_logs"].append(e_res["log"])

        # Step 7: SAR Generator Agent
        sar_res = sar_generator_agent.execute(state)
        state["sar_draft"] = sar_res["sar_draft"]
        state["agent_logs"].append(sar_res["log"])

        state["overall_status"] = "COMPLETED"
        state["end_time"] = datetime.utcnow().isoformat()

        return state

    def run_investigation_stream(
        self,
        alert_id: str,
        customer_profile: Dict[str, Any],
        account_number: str,
        transactions: List[Dict[str, Any]],
        case_id: str = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Yields step-by-step progress events for real-time frontend streaming visualization.
        """
        if not case_id:
            case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        state: InvestigationState = {
            "case_id": case_id,
            "alert_id": alert_id,
            "customer_id": customer_profile.get("customer_id", ""),
            "account_number": account_number,
            "customer_profile": customer_profile,
            "accounts": [],
            "transactions": transactions,
            "planner_plan": {},
            "transaction_findings": {},
            "kyc_findings": {},
            "sanction_findings": {},
            "graph_findings": {},
            "risk_assessment": {},
            "rag_evidence": [],
            "sar_draft": {},
            "agent_logs": [],
            "overall_status": "IN_PROGRESS",
            "start_time": datetime.utcnow().isoformat(),
            "end_time": None
        }

        # Yield Initial Event
        yield {
            "type": "STAGE_STARTED",
            "agent": "Planner Agent",
            "message": "Initializing multi-agent investigation plan...",
            "step": 1,
            "total_steps": 7
        }

        # 1. Planner
        p_res = planner_agent.execute(state)
        state["planner_plan"] = p_res["plan"]
        state["agent_logs"].append(p_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "Planner Agent",
            "log": p_res["log"],
            "data": p_res["plan"],
            "step": 1
        }

        # 2. Transaction Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "Transaction Agent",
            "message": "Analyzing ledger velocity and IsolationForest anomalies...",
            "step": 2,
            "total_steps": 7
        }
        t_res = transaction_agent.execute(state)
        state["transaction_findings"] = t_res["findings"]
        state["agent_logs"].append(t_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "Transaction Agent",
            "log": t_res["log"],
            "data": t_res["findings"],
            "step": 2
        }

        # 3. KYC Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "KYC & Entity Agent",
            "message": "Screening PEP status and corporate opacity...",
            "step": 3,
            "total_steps": 7
        }
        k_res = kyc_agent.execute(state)
        state["kyc_findings"] = k_res["findings"]
        state["agent_logs"].append(k_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "KYC & Entity Agent",
            "log": k_res["log"],
            "data": k_res["findings"],
            "step": 3
        }

        # 4. Sanction Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "Sanction & Document Agent",
            "message": "Matching counterparties against OFAC SDN & Watchlists...",
            "step": 4,
            "total_steps": 7
        }
        s_res = sanction_agent.execute(state)
        state["sanction_findings"] = s_res["findings"]
        state["agent_logs"].append(s_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "Sanction & Document Agent",
            "log": s_res["log"],
            "data": s_res["findings"],
            "step": 4
        }

        # 5. Risk Engine Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "Fraud/AML Risk Engine",
            "message": "Computing network graph topology and risk factor decomposition...",
            "step": 5,
            "total_steps": 7
        }
        r_res = risk_engine_agent.execute(state)
        state["risk_assessment"] = r_res["risk_assessment"]
        state["graph_findings"] = r_res["graph_findings"]
        state["agent_logs"].append(r_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "Fraud/AML Risk Engine",
            "log": r_res["log"],
            "data": {"risk_assessment": r_res["risk_assessment"], "graph": r_res["graph_findings"]},
            "step": 5
        }

        # 6. Evidence RAG Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "Evidence + RAG Agent",
            "message": "Retrieving matching FATF / FinCEN red flag typologies...",
            "step": 6,
            "total_steps": 7
        }
        e_res = evidence_rag_agent.execute(state)
        state["rag_evidence"] = e_res["rag_evidence"]
        state["agent_logs"].append(e_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "Evidence + RAG Agent",
            "log": e_res["log"],
            "data": e_res["rag_evidence"],
            "step": 6
        }

        # 7. SAR Generator Agent
        yield {
            "type": "STAGE_STARTED",
            "agent": "SAR Generator Agent",
            "message": "Drafting audit-ready Suspicious Activity Report narrative...",
            "step": 7,
            "total_steps": 7
        }
        sar_res = sar_generator_agent.execute(state)
        state["sar_draft"] = sar_res["sar_draft"]
        state["agent_logs"].append(sar_res["log"])
        yield {
            "type": "AGENT_COMPLETED",
            "agent": "SAR Generator Agent",
            "log": sar_res["log"],
            "data": sar_res["sar_draft"],
            "step": 7
        }

        state["overall_status"] = "COMPLETED"
        state["end_time"] = datetime.utcnow().isoformat()

        yield {
            "type": "INVESTIGATION_FINISHED",
            "full_state": state
        }

orchestrator = AMLInvestigationOrchestrator()
