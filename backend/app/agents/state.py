from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime

class AgentLogEntry(TypedDict):
    timestamp: str
    agent: str
    stage: str # STARTED, THINKING, RETRIEVED_DATA, COMPLETED, ERROR
    thought: str
    action: str
    output_summary: str
    confidence: float
    execution_time_ms: int

class InvestigationState(TypedDict):
    case_id: str
    alert_id: str
    customer_id: str
    account_number: str
    
    # Input entity data
    customer_profile: Dict[str, Any]
    accounts: List[Dict[str, Any]]
    transactions: List[Dict[str, Any]]
    
    # Agent analytical outputs
    planner_plan: Dict[str, Any]
    transaction_findings: Dict[str, Any]
    kyc_findings: Dict[str, Any]
    sanction_findings: Dict[str, Any]
    graph_findings: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    rag_evidence: List[Dict[str, Any]]
    sar_draft: Dict[str, Any]
    
    # Telemetry and audit trail
    agent_logs: List[Dict[str, Any]]
    overall_status: str
    start_time: str
    end_time: Optional[str]
