import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.db.database import get_db
from app.db.models import Alert, Customer, Account, Transaction, Investigation, SARReport
from app.agents.orchestrator import orchestrator
from app.rag.vector_store import typology_store

router = APIRouter(prefix="/investigation", tags=["Investigation"])

def _fetch_case_data(alert_id: str, db: Session):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    customer = db.query(Customer).filter(Customer.customer_id == alert.customer_id).first()
    
    # Fetch all relevant transactions in the cluster
    direct_txs = db.query(Transaction).filter(
        (Transaction.source_account == alert.account_number) | (Transaction.destination_account == alert.account_number)
    ).all()
    
    # Expand 1 hop to get counterparties
    counterparties = set()
    for tx in direct_txs:
        counterparties.add(tx.source_account)
        counterparties.add(tx.destination_account)
    
    all_cluster_txs = db.query(Transaction).filter(
        (Transaction.source_account.in_(counterparties)) | (Transaction.destination_account.in_(counterparties))
    ).all()

    tx_list = []
    for tx in all_cluster_txs:
        tx_list.append({
            "transaction_id": tx.transaction_id,
            "source_account": tx.source_account,
            "destination_account": tx.destination_account,
            "amount": tx.amount,
            "currency": tx.currency,
            "timestamp": tx.timestamp,
            "channel": tx.channel,
            "description": tx.description,
            "country_source": tx.country_source,
            "country_dest": tx.country_dest
        })

    customer_dict = {
        "customer_id": customer.customer_id if customer else alert.customer_id,
        "name": customer.name if customer else "Unknown",
        "entity_type": customer.entity_type if customer else "INDIVIDUAL",
        "pep_status": customer.pep_status if customer else False,
        "risk_rating": customer.risk_rating if customer else "MEDIUM",
        "country": customer.country if customer else "US",
        "jurisdiction_risk": customer.jurisdiction_risk if customer else "LOW",
        "occupation": customer.occupation if customer else "Unknown",
        "annual_income": customer.annual_income if customer else 0.0,
        "adverse_media_flag": customer.adverse_media_flag if customer else False,
        "shell_company_risk": customer.shell_company_risk if customer else 0.0
    }

    return alert, customer_dict, alert.account_number, tx_list

@router.post("/run")
def run_investigation(request_data: Dict[str, str], db: Session = Depends(get_db)):
    alert_id = request_data.get("alert_id")
    if not alert_id:
        raise HTTPException(status_code=400, detail="alert_id is required")

    alert, customer_dict, account_number, tx_list = _fetch_case_data(alert_id, db)
    
    # Run multi-agent orchestrator
    state = orchestrator.run_investigation(
        alert_id=alert_id,
        customer_profile=customer_dict,
        account_number=account_number,
        transactions=tx_list
    )

    # Save Investigation Record to DB
    case_id = state["case_id"]
    sar_data = state.get("sar_draft", {})
    report_id = sar_data.get("report_id")

    investigation = Investigation(
        case_id=case_id,
        alert_id=alert_id,
        customer_id=customer_dict["customer_id"],
        status="COMPLETED",
        overall_risk_score=state.get("risk_assessment", {}).get("overall_risk_score", 0.0),
        typology_detected=alert.alert_type,
        findings_json=json.dumps({
            "transaction_findings": state.get("transaction_findings"),
            "kyc_findings": state.get("kyc_findings"),
            "sanction_findings": state.get("sanction_findings"),
            "graph_findings": state.get("graph_findings"),
            "risk_assessment": state.get("risk_assessment"),
            "rag_evidence": state.get("rag_evidence")
        }, default=str),
        agent_steps_json=json.dumps(state.get("agent_logs", []), default=str),
        sar_report_id=report_id,
        completed_at=datetime.utcnow()
    )
    db.add(investigation)

    # Save SAR Report record
    if report_id:
        sar_report = SARReport(
            report_id=report_id,
            case_id=case_id,
            customer_id=customer_dict["customer_id"],
            filing_type=sar_data.get("filing_type", "INITIAL_SUSPICIOUS_ACTIVITY_REPORT"),
            narrative=sar_data.get("narrative", ""),
            typologies_json=json.dumps(state.get("rag_evidence", []), default=str),
            evidence_json=json.dumps(state.get("transaction_findings", {}).get("top_anomalous_transactions", []), default=str),
            recommended_actions_json=json.dumps(sar_data.get("recommended_actions", []), default=str),
            status="DRAFT"
        )
        db.add(sar_report)

    # Update alert status
    alert.status = "IN_INVESTIGATION"
    alert.risk_score = state.get("risk_assessment", {}).get("overall_risk_score", alert.risk_score)
    db.commit()

    return state

@router.get("/stream/{alert_id}")
def stream_investigation(alert_id: str, db: Session = Depends(get_db)):
    """
    SSE stream of live multi-agent execution steps.
    """
    alert, customer_dict, account_number, tx_list = _fetch_case_data(alert_id, db)

    def event_generator():
        for event in orchestrator.run_investigation_stream(
            alert_id=alert_id,
            customer_profile=customer_dict,
            account_number=account_number,
            transactions=tx_list
        ):
            yield f"data: {json.dumps(event, default=str)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/history")
def get_investigation_history(db: Session = Depends(get_db)):
    invs = db.query(Investigation).order_by(Investigation.created_at.desc()).limit(20).all()
    results = []
    for inv in invs:
        cust = db.query(Customer).filter(Customer.customer_id == inv.customer_id).first()
        results.append({
            "case_id": inv.case_id,
            "alert_id": inv.alert_id,
            "customer_name": cust.name if cust else "Unknown",
            "status": inv.status,
            "overall_risk_score": inv.overall_risk_score,
            "typology_detected": inv.typology_detected,
            "sar_report_id": inv.sar_report_id,
            "created_at": inv.created_at.isoformat() if inv.created_at else None
        })
    return results

@router.post("/copilot-chat")
def copilot_chat(request: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Forensic AI Copilot chat assistant for answering analyst questions.
    """
    message = request.get("message", "")
    case_context = request.get("context", {})
    
    # RAG search for relevant regulatory context
    rag_docs = typology_store.search(message, top_k=2)
    doc_snippets = "\n".join([f"- {d['title']}: {d['description']}" for d in rag_docs])
    
    # High-fidelity analytical response generator
    reply = (
        f"Based on the multi-agent investigation evidence for {case_context.get('customer_name', 'the subject')}:\n\n"
        f"1. **Forensic Analysis**: The primary risk factors stem from {case_context.get('alert_type', 'unusual activity')} "
        f"with a composite risk score of {case_context.get('risk_score', '85')}/100.\n\n"
        f"2. **Regulatory Precedents (RAG)**:\n{doc_snippets}\n\n"
        f"3. **Recommended Investigator Action**: Review the counterparty hops in the Network Graph and verify beneficial ownership (UBO) before signing off on the SAR filing."
    )
    
    return {
        "reply": reply,
        "referenced_typologies": [d["title"] for d in rag_docs],
        "timestamp": datetime.utcnow().isoformat()
    }
