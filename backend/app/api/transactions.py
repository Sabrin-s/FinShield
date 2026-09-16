import uuid
import json
import csv
import io
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
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
    Live Simulator: Injects dynamic AML topology scenarios.
    Types: SMURFING_INJECTION, CIRCULAR_INJECTION, MULE_RING_INJECTION, SANCTION_INJECTION, CUSTOM_INJECTION
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
        
        acc = Account(account_number=acc_num, customer_id=cust_id, account_type="BUSINESS", balance=65000.0)
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
            summary="Rapid below-threshold cash structured deposits totaling $57,000 within 24h to evade CTR reporting.",
            triggered_rules='["RULE-AML-01", "RULE-AML-02"]'
        )
        db.add(alert)

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

    elif scenario_type == "MULE_RING_INJECTION":
        cust_id = f"CUST-MULE-{unique_suffix}"
        acc_num = f"ACC-MULE-HUB-{unique_suffix}"
        
        cust = Customer(
            customer_id=cust_id,
            name=f"Apex Swift Logistics {unique_suffix}",
            entity_type="LLC",
            pep_status=False,
            risk_rating="HIGH",
            country="US",
            jurisdiction_risk="MEDIUM",
            occupation="Courier & Express Dispatch",
            annual_income=140000.0,
            shell_company_risk=0.55
        )
        db.add(cust)

        acc = Account(account_number=acc_num, customer_id=cust_id, account_type="BUSINESS", balance=185000.0)
        db.add(acc)

        alt_id = f"ALT-MULE-{unique_suffix}"
        alert = Alert(
            alert_id=alt_id,
            customer_id=cust_id,
            account_number=acc_num,
            alert_type="MULE_RING",
            severity="HIGH",
            risk_score=91.0,
            title=f"Live Injected: Rapid Money Mule Dispersal Network ({unique_suffix})",
            summary="Inbound wire of $180,000 rapidly dispersed across 5 intermediary mule accounts within 4 hours.",
            triggered_rules='["RULE-AML-05", "RULE-AML-06"]'
        )
        db.add(alert)

        # Inbound lump-sum wire
        tx_in = Transaction(
            transaction_id=f"TX-MULE-IN-{unique_suffix}",
            source_account=f"ACC-OFFSHORE-ORIGIN-{unique_suffix}",
            destination_account=acc_num,
            amount=180000.0,
            timestamp=now - timedelta(hours=8),
            channel="WIRE",
            description="Urgent Global Freight Logistics Settlement",
            country_source="CY",
            country_dest="US",
            is_suspicious=True,
            anomaly_score=88.0,
            typology_tag="MULE_RING"
        )
        db.add(tx_in)

        # 5 Rapid Outbound Mule Dispersals
        for i in range(5):
            mule_amt = 35200.0 - (i * 350.0)
            tx_out = Transaction(
                transaction_id=f"TX-MULE-OUT-{unique_suffix}-{i+1}",
                source_account=acc_num,
                destination_account=f"ACC-MULE-RECV-{unique_suffix}-{i+1}",
                amount=mule_amt,
                timestamp=now - timedelta(hours=6 - i),
                channel="P2P_TRANSFER",
                description=f"Immediate Dispatch Compensation Subcontractor #{i+1}",
                country_source="US",
                country_dest="US",
                is_suspicious=True,
                anomaly_score=91.0,
                typology_tag="MULE_RING"
            )
            db.add(tx_out)

        db.commit()
        return {
            "status": "SUCCESS",
            "message": "Money mule dispersal ring successfully injected!",
            "alert_id": alt_id,
            "account_number": acc_num,
            "customer_id": cust_id
        }

    elif scenario_type == "SANCTION_INJECTION":
        cust_id = f"CUST-SNC-{unique_suffix}"
        acc_num = f"ACC-SNC-ROOT-{unique_suffix}"
        
        cust = Customer(
            customer_id=cust_id,
            name=f"Al-Bahar Trading Group {unique_suffix}",
            entity_type="CORP",
            pep_status=True,
            risk_rating="CRITICAL",
            country="AE",
            jurisdiction_risk="HIGH",
            occupation="Commodities Brokering",
            annual_income=4500000.0,
            adverse_media_flag=True,
            shell_company_risk=0.79
        )
        db.add(cust)

        acc = Account(account_number=acc_num, customer_id=cust_id, account_type="OFFSHORE", balance=750000.0)
        db.add(acc)

        alt_id = f"ALT-SNC-{unique_suffix}"
        alert = Alert(
            alert_id=alt_id,
            customer_id=cust_id,
            account_number=acc_num,
            alert_type="SANCTION_HIT",
            severity="CRITICAL",
            risk_score=98.5,
            title=f"Live Injected: High-Risk OFAC Watchlist Wire Transfer ({unique_suffix})",
            summary="Attempted $320,000 wire with counterparty matching prohibited OFAC SDGT designated entity.",
            triggered_rules='["RULE-SANCTION-01", "RULE-SANCTION-02"]'
        )
        db.add(alert)

        tx = Transaction(
            transaction_id=f"TX-SNC-{unique_suffix}",
            source_account=acc_num,
            destination_account="ACC-SANCTIONED-GLOBAL-01",
            amount=320000.0,
            timestamp=now - timedelta(hours=3),
            channel="WIRE",
            description="Prohibited Dual-Use Electronic Component Invoice",
            country_source="AE",
            country_dest="RU",
            is_suspicious=True,
            anomaly_score=99.0,
            typology_tag="SANCTION_HIT"
        )
        db.add(tx)

        db.commit()
        return {
            "status": "SUCCESS",
            "message": "Sanctions watchlist evasion scenario successfully injected!",
            "alert_id": alt_id,
            "account_number": acc_num,
            "customer_id": cust_id
        }

    elif scenario_type == "CUSTOM_INJECTION":
        cust_name = scenario.get("customer_name") or f"Custom Entity {unique_suffix}"
        entity_type = scenario.get("entity_type", "LLC")
        country = scenario.get("country", "US")
        typology = scenario.get("alert_type", "STRUCTURING")
        severity = scenario.get("severity", "HIGH")
        title = scenario.get("title") or f"Custom Forensic Injection: {cust_name}"
        summary = scenario.get("summary") or f"Custom user-submitted forensic scenario for {cust_name}."
        amount = float(scenario.get("amount", 75000.0))
        tx_list = scenario.get("transactions", [])

        cust_id = f"CUST-CUSTM-{unique_suffix}"
        acc_num = scenario.get("account_number") or f"ACC-CUSTM-{unique_suffix}"

        cust = Customer(
            customer_id=cust_id,
            name=cust_name,
            entity_type=entity_type,
            pep_status=bool(scenario.get("pep_status", False)),
            risk_rating=severity,
            country=country,
            jurisdiction_risk="HIGH" if country in ["KY", "VG", "PA", "RU", "IR"] else "MEDIUM",
            occupation=scenario.get("occupation", "Commercial Enterprise"),
            annual_income=float(scenario.get("annual_income", 250000.0)),
            shell_company_risk=float(scenario.get("shell_company_risk", 0.5))
        )
        db.add(cust)

        acc = Account(account_number=acc_num, customer_id=cust_id, account_type="BUSINESS", balance=amount * 1.5)
        db.add(acc)

        alt_id = f"ALT-CUSTM-{unique_suffix}"
        alert = Alert(
            alert_id=alt_id,
            customer_id=cust_id,
            account_number=acc_num,
            alert_type=typology,
            severity=severity,
            risk_score=float(scenario.get("risk_score", 85.0)),
            title=title,
            summary=summary,
            triggered_rules=json.dumps(scenario.get("triggered_rules", ["RULE-CUSTOM-01"]))
        )
        db.add(alert)

        if tx_list and isinstance(tx_list, list):
            for i, item in enumerate(tx_list):
                tx = Transaction(
                    transaction_id=str(item.get("transaction_id") or f"TX-CUSTM-{unique_suffix}-{i+1}"),
                    source_account=str(item.get("source_account") or f"ACC-SRC-{i+1}"),
                    destination_account=str(item.get("destination_account") or acc_num),
                    amount=float(item.get("amount", amount)),
                    timestamp=now - timedelta(hours=i*2 + 1),
                    channel=str(item.get("channel", "WIRE")),
                    description=str(item.get("description", "Custom Transaction Ingestion")),
                    country_source=str(item.get("country_source", country)),
                    country_dest=str(item.get("country_dest", "US")),
                    is_suspicious=True,
                    anomaly_score=float(item.get("anomaly_score", 80.0)),
                    typology_tag=typology
                )
                db.add(tx)
        else:
            tx = Transaction(
                transaction_id=f"TX-CUSTM-{unique_suffix}",
                source_account=f"ACC-SRC-{unique_suffix}",
                destination_account=acc_num,
                amount=amount,
                timestamp=now,
                channel=scenario.get("channel", "WIRE"),
                description=summary,
                country_source=country,
                country_dest="US",
                is_suspicious=True,
                anomaly_score=85.0,
                typology_tag=typology
            )
            db.add(tx)

        db.commit()
        return {
            "status": "SUCCESS",
            "message": f"Custom scenario for '{cust_name}' successfully created!",
            "alert_id": alt_id,
            "account_number": acc_num,
            "customer_id": cust_id
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario type {scenario_type}")

@router.post("/upload")
async def upload_transactions_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Direct file upload: Accepts .json or .csv files containing transactions.
    Automatically wraps them into an AML Investigation case and alert.
    """
    unique_suffix = uuid.uuid4().hex[:4].upper()
    now = datetime.utcnow()
    filename = file.filename.lower() if file.filename else "upload.json"
    contents = await file.read()
    
    parsed_transactions = []
    customer_name = f"Uploaded Entity {unique_suffix}"
    total_amount = 0.0

    try:
        if filename.endswith(".json"):
            data = json.loads(contents.decode("utf-8"))
            if isinstance(data, dict):
                customer_name = data.get("customer_name", customer_name)
                parsed_transactions = data.get("transactions", [data])
            elif isinstance(data, list):
                parsed_transactions = data
        elif filename.endswith(".csv"):
            text_stream = io.StringIO(contents.decode("utf-8"))
            reader = csv.DictReader(text_stream)
            for row in reader:
                parsed_transactions.append(row)
        else:
            raise HTTPException(status_code=400, detail="Only .json and .csv files are supported.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

    if not parsed_transactions:
        raise HTTPException(status_code=400, detail="No transaction records found in uploaded file.")

    cust_id = f"CUST-UPL-{unique_suffix}"
    acc_num = f"ACC-UPL-{unique_suffix}"

    cust = Customer(
        customer_id=cust_id,
        name=customer_name,
        entity_type="LLC",
        risk_rating="HIGH",
        country="US",
        jurisdiction_risk="MEDIUM",
        annual_income=500000.0,
        shell_company_risk=0.65
    )
    db.add(cust)

    acc = Account(account_number=acc_num, customer_id=cust_id, account_type="BUSINESS", balance=250000.0)
    db.add(acc)

    alt_id = f"ALT-UPL-{unique_suffix}"
    alert = Alert(
        alert_id=alt_id,
        customer_id=cust_id,
        account_number=acc_num,
        alert_type="BATCH_UPLOAD",
        severity="HIGH",
        risk_score=86.0,
        title=f"Uploaded Batch File: {file.filename} ({len(parsed_transactions)} txs)",
        summary=f"Automated forensic analysis of {len(parsed_transactions)} transactions uploaded from {file.filename}.",
        triggered_rules='["RULE-FILE-UPLOAD", "RULE-ANOMALY-DETECTION"]'
    )
    db.add(alert)

    for i, item in enumerate(parsed_transactions):
        try:
            amt = float(item.get("amount", 10000.0))
        except (ValueError, TypeError):
            amt = 10000.0
        total_amount += amt
        
        tx = Transaction(
            transaction_id=str(item.get("transaction_id") or f"TX-UPL-{unique_suffix}-{i+1}"),
            source_account=str(item.get("source_account") or f"ACC-EXT-{i+1}"),
            destination_account=str(item.get("destination_account") or acc_num),
            amount=amt,
            timestamp=now - timedelta(hours=i*2 + 1),
            channel=str(item.get("channel") or "WIRE"),
            description=str(item.get("description") or f"Batch Upload Row #{i+1}"),
            country_source=str(item.get("country_source") or "US"),
            country_dest=str(item.get("country_dest") or "US"),
            is_suspicious=True,
            anomaly_score=82.0,
            typology_tag="BATCH_UPLOAD"
        )
        db.add(tx)

    db.commit()

    return {
        "status": "SUCCESS",
        "message": f"Successfully parsed {len(parsed_transactions)} transactions from {file.filename}!",
        "alert_id": alt_id,
        "account_number": acc_num,
        "customer_id": cust_id,
        "total_amount": total_amount,
        "transactions_count": len(parsed_transactions)
    }
