import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.db.models import Transaction, Alert, Customer, Account

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/")
def get_transactions(
    account_number: Optional[str] = None,
    only_suspicious: bool = False,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if account_number:
        query = query.filter(
            (Transaction.source_account == account_number) | (Transaction.destination_account == account_number)
        )
    if only_suspicious:
        query = query.filter(Transaction.is_suspicious == True)
    
    txs = query.order_by(Transaction.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "transaction_id": tx.transaction_id,
            "source_account": tx.source_account,
            "destination_account": tx.destination_account,
            "amount": tx.amount,
            "currency": tx.currency,
            "timestamp": tx.timestamp.isoformat() if tx.timestamp else None,
            "channel": tx.channel,
            "description": tx.description,
            "country_source": tx.country_source,
            "country_dest": tx.country_dest,
            "is_suspicious": tx.is_suspicious,
            "anomaly_score": tx.anomaly_score,
            "typology_tag": tx.typology_tag
        }
        for tx in txs
    ]

@router.post("/simulate")
def inject_simulation_scenario(scenario: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Live Simulator: Injects dynamic AML topology scenario into the platform.
    Types: SMURFING_INJECTION, CIRCULAR_INJECTION, MULE_RING_INJECTION, SANCTION_INJECTION
    """
    scenario_type = scenario.get("scenario_type", "SMURFING_INJECTION")
    now = datetime.utcnow()
    unique_suffix = uuid.uuid4().hex[:4].upper()

    if scenario_type == "SMURFING_INJECTION":
        cust_id = f"CUST-SIM-{unique_suffix}"
        acc_num = f"ACC-SIM-{unique_suffix}"
        
        cust = Customer(
            customer_id=cust_id,
            name=f"Vanguard Trade Services {unique_suffix}",
            entity_type="LLC",
            pep_status=False,
            risk_rating="HIGH",
            country="US",
            jurisdiction_risk="MEDIUM",
            occupation="Import/Export Consulting",
            annual_income=180000.0,
            shell_company_risk=0.45
        )
        db.add(cust)
        
        acc = Account(
            account_number=acc_num,
            customer_id=cust_id,
            account_type="BUSINESS",
            balance=65000.0
        )
        db.add(acc)

        alt_id = f"ALT-SIM-{unique_suffix}"
        alert = Alert(
            alert_id=alt_id,
            customer_id=cust_id,
            account_number=acc_num,
            alert_type="STRUCTURING",
            severity="HIGH",
            risk_score=87.5,
            title=f"Live Injected: High-Frequency Smurfing Bursts ({unique_suffix})",
            summary="Rapid below-threshold cash structured deposits totaling $57,000 within 24h.",
            triggered_rules='["RULE-AML-01", "RULE-AML-02"]'
        )
        db.add(alert)

        # Inject 6 structured txs
        amounts = [9400.0, 9600.0, 9150.0, 9800.0, 9550.0, 9700.0]
        for i, amt in enumerate(amounts):
            tx = Transaction(
                transaction_id=f"TX-SIM-{unique_suffix}-{i+1}",
                source_account=f"ACC-BRANCH-CASH-{i+1}",
                destination_account=acc_num,
                amount=amt,
                timestamp=now - timedelta(hours=24 - (i*3)),
                channel="CASH_DEPOSIT",
                description=f"Automated Cash Deposit - Teller Station #{i+1}",
                is_suspicious=True,
                anomaly_score=85.0,
                typology_tag="STRUCTURING"
            )
            db.add(tx)
        
        db.commit()
        return {
            "status": "SUCCESS",
            "message": "Smurfing topology successfully injected!",
            "alert_id": alt_id,
            "account_number": acc_num,
            "customer_id": cust_id
        }

    elif scenario_type == "CIRCULAR_INJECTION":
        cust_id = f"CUST-CIR-{unique_suffix}"
        acc_num = f"ACC-CIR-ROOT-{unique_suffix}"
        
        cust = Customer(
            customer_id=cust_id,
            name=f"Orion Offshore Capital {unique_suffix}",
            entity_type="CORP",
            pep_status=False,
            risk_rating="CRITICAL",
            country="KY",
            jurisdiction_risk="HIGH",
            occupation="Offshore Portfolio Investment",
            annual_income=2500000.0,
            adverse_media_flag=True,
            shell_company_risk=0.88
        )
        db.add(cust)

        acc = Account(account_number=acc_num, customer_id=cust_id, account_type="OFFSHORE", balance=500000.0)
        db.add(acc)

        alt_id = f"ALT-CIR-{unique_suffix}"
        alert = Alert(
            alert_id=alt_id,
            customer_id=cust_id,
            account_number=acc_num,
            alert_type="CIRCULAR_FLOW",
            severity="CRITICAL",
            risk_score=94.0,
            title=f"Live Injected: 4-Hop Offshore Round-Trip Flow ({unique_suffix})",
            summary="Multi-jurisdiction loop originating and returning $450,000 to same principal entity.",
            triggered_rules='["RULE-AML-03", "RULE-AML-04"]'
        )
        db.add(alert)

        # Build 4-hop circular loop
        nodes = [acc_num, f"ACC-PANAMA-{unique_suffix}", f"ACC-CYPRUS-{unique_suffix}", f"ACC-DUBAI-{unique_suffix}"]
        for i in range(len(nodes)):
            src = nodes[i]
            dest = nodes[(i+1) % len(nodes)]
            tx = Transaction(
                transaction_id=f"TX-CIR-{unique_suffix}-{i+1}",
                source_account=src,
                destination_account=dest,
                amount=450000.0 - (i * 5000.0),
                timestamp=now - timedelta(hours=30 - (i*6)),
                channel="WIRE",
                description=f"Consultancy Settlement Step #{i+1}",
                country_source="KY" if i==0 else "PA" if i==1 else "CY" if i==2 else "AE",
                country_dest="PA" if i==0 else "CY" if i==1 else "AE" if i==2 else "KY",
                is_suspicious=True,
                anomaly_score=92.0,
                typology_tag="CIRCULAR_FLOW"
            )
            db.add(tx)

        db.commit()
        return {
            "status": "SUCCESS",
            "message": "Circular round-trip topology successfully injected!",
            "alert_id": alt_id,
            "account_number": acc_num,
            "customer_id": cust_id
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario type {scenario_type}")
