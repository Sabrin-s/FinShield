from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json

from app.db.database import get_db
from app.db.models import Alert, Customer, Account, Transaction

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/")
def get_alerts(status: Optional[str] = None, severity: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.risk_score.desc()).all()
    results = []
    for a in alerts:
        cust = db.query(Customer).filter(Customer.customer_id == a.customer_id).first()
        results.append({
            "alert_id": a.alert_id,
            "customer_id": a.customer_id,
            "customer_name": cust.name if cust else "Unknown",
            "entity_type": cust.entity_type if cust else "INDIVIDUAL",
            "pep_status": cust.pep_status if cust else False,
            "account_number": a.account_number,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "risk_score": a.risk_score,
            "status": a.status,
            "title": a.title,
            "summary": a.summary,
            "triggered_rules": json.loads(a.triggered_rules or "[]"),
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return results

@router.get("/{alert_id}")
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    customer = db.query(Customer).filter(Customer.customer_id == alert.customer_id).first()
    account = db.query(Account).filter(Account.account_number == alert.account_number).first()
    
    txs = db.query(Transaction).filter(
        (Transaction.source_account == alert.account_number) | (Transaction.destination_account == alert.account_number)
    ).all()
    
    return {
        "alert": {
            "alert_id": alert.alert_id,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "risk_score": alert.risk_score,
            "status": alert.status,
            "title": alert.title,
            "summary": alert.summary,
            "triggered_rules": json.loads(alert.triggered_rules or "[]"),
            "created_at": alert.created_at.isoformat()
        },
        "customer": {
            "customer_id": customer.customer_id if customer else None,
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
        },
        "account": {
            "account_number": account.account_number if account else alert.account_number,
            "account_type": account.account_type if account else "CHECKING",
            "balance": account.balance if account else 0.0,
            "currency": account.currency if account else "USD"
        },
        "transactions_count": len(txs)
    }

@router.patch("/{alert_id}/status")
def update_alert_status(alert_id: str, status_data: Dict[str, str], db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    new_status = status_data.get("status")
    if new_status:
        alert.status = new_status
        db.commit()
    return {"message": "Alert status updated", "alert_id": alert_id, "status": alert.status}
