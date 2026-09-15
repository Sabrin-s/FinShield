import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.db.models import SARReport, Customer

router = APIRouter(prefix="/sar", tags=["SAR Reports"])

@router.get("/")
def get_all_sars(db: Session = Depends(get_db)):
    sars = db.query(SARReport).order_by(SARReport.created_at.desc()).all()
    results = []
    for s in sars:
        cust = db.query(Customer).filter(Customer.customer_id == s.customer_id).first()
        results.append({
            "report_id": s.report_id,
            "case_id": s.case_id,
            "customer_id": s.customer_id,
            "customer_name": cust.name if cust else "Unknown",
            "filing_type": s.filing_type,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return results

@router.get("/{report_id}")
def get_sar_detail(report_id: str, db: Session = Depends(get_db)):
    sar = db.query(SARReport).filter(SARReport.report_id == report_id).first()
    if not sar:
        raise HTTPException(status_code=404, detail="SAR report not found")

    cust = db.query(Customer).filter(Customer.customer_id == sar.customer_id).first()

    return {
        "report_id": sar.report_id,
        "case_id": sar.case_id,
        "customer_id": sar.customer_id,
        "customer_name": cust.name if cust else "Unknown",
        "filing_type": sar.filing_type,
        "narrative": sar.narrative,
        "typologies": json.loads(sar.typologies_json or "[]"),
        "evidence": json.loads(sar.evidence_json or "[]"),
        "recommended_actions": json.loads(sar.recommended_actions_json or "[]"),
        "status": sar.status,
        "created_at": sar.created_at.isoformat() if sar.created_at else None
    }

@router.patch("/{report_id}/status")
def update_sar_status(report_id: str, update_data: Dict[str, str], db: Session = Depends(get_db)):
    sar = db.query(SARReport).filter(SARReport.report_id == report_id).first()
    if not sar:
        raise HTTPException(status_code=404, detail="SAR report not found")
    
    new_status = update_data.get("status")
    if new_status:
        sar.status = new_status
        db.commit()
    return {"message": "SAR status updated", "report_id": report_id, "status": sar.status}
