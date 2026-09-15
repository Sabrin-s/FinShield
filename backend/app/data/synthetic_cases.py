from datetime import datetime, timedelta

def get_synthetic_cases():
    now = datetime.utcnow()
    
    cases = [
        {
            "case_key": "CASE-SMURF-01",
            "alert_id": "ALT-2026-8801",
            "customer": {
                "customer_id": "CUST-8801",
                "name": "Apex Commercial Logistics LLC",
                "entity_type": "LLC",
                "pep_status": False,
                "risk_rating": "HIGH",
                "country": "US",
                "jurisdiction_risk": "MEDIUM",
                "occupation": "Freight & Warehousing",
                "annual_income": 420000.0,
                "adverse_media_flag": False,
                "shell_company_risk": 0.35
            },
            "account": {
                "account_number": "ACC-US-991024",
                "account_type": "BUSINESS",
                "currency": "USD",
                "balance": 84500.0
            },
            "alert": {
                "alert_id": "ALT-2026-8801",
                "customer_id": "CUST-8801",
                "account_number": "ACC-US-991024",
                "alert_type": "STRUCTURING",
                "severity": "HIGH",
                "risk_score": 84.5,
                "title": "Suspected Below-Threshold Structuring (Smurfing)",
                "summary": "Consecutive cash & wire deposits between $9,100 and $9,900 across 3 days followed by single outward wire.",
                "triggered_rules": ["RULE-AML-01", "RULE-AML-02"]
            },
            "transactions": [
                {"transaction_id": "TX-SM-001", "source_account": "ACC-CASH-DEP-01", "destination_account": "ACC-US-991024", "amount": 9400.0, "timestamp": now - timedelta(hours=48), "channel": "CASH_DEPOSIT", "description": "Branch cash deposit - Midtown", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-SM-002", "source_account": "ACC-CASH-DEP-02", "destination_account": "ACC-US-991024", "amount": 9650.0, "timestamp": now - timedelta(hours=44), "channel": "CASH_DEPOSIT", "description": "Branch cash deposit - Queens", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-SM-003", "source_account": "ACC-CASH-DEP-03", "destination_account": "ACC-US-991024", "amount": 9200.0, "timestamp": now - timedelta(hours=36), "channel": "CASH_DEPOSIT", "description": "Branch cash deposit - Brooklyn", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-SM-004", "source_account": "ACC-CASH-DEP-04", "destination_account": "ACC-US-991024", "amount": 9850.0, "timestamp": now - timedelta(hours=28), "channel": "CASH_DEPOSIT", "description": "Branch cash deposit - Bronx", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-SM-005", "source_account": "ACC-CASH-DEP-05", "destination_account": "ACC-US-991024", "amount": 9500.0, "timestamp": now - timedelta(hours=20), "channel": "CASH_DEPOSIT", "description": "Branch cash deposit - Manhattan", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-SM-006", "source_account": "ACC-US-991024", "destination_account": "ACC-OFFSHORE-774", "amount": 47000.0, "timestamp": now - timedelta(hours=6), "channel": "WIRE", "description": "Urgent Freight Consultation Advance", "country_source": "US", "country_dest": "PA"}
            ]
        },
        {
            "case_key": "CASE-CIRCULAR-02",
            "alert_id": "ALT-2026-8802",
            "customer": {
                "customer_id": "CUST-8802",
                "name": "Helios Maritime Holdings Ltd",
                "entity_type": "CORP",
                "pep_status": False,
                "risk_rating": "CRITICAL",
                "country": "VG",
                "jurisdiction_risk": "HIGH",
                "occupation": "Maritime Leasing & Brokerage",
                "annual_income": 1250000.0,
                "adverse_media_flag": True,
                "shell_company_risk": 0.82
            },
            "account": {
                "account_number": "ACC-VG-551090",
                "account_type": "OFFSHORE",
                "currency": "USD",
                "balance": 240000.0
            },
            "alert": {
                "alert_id": "ALT-2026-8802",
                "customer_id": "CUST-8802",
                "account_number": "ACC-VG-551090",
                "alert_type": "CIRCULAR_FLOW",
                "severity": "CRITICAL",
                "risk_score": 92.0,
                "title": "Closed-Loop Round-Trip Fund Layering",
                "summary": "Funds routed through 4 shell accounts across 3 jurisdictions returning 95% of principal to originator.",
                "triggered_rules": ["RULE-AML-03", "RULE-AML-04"]
            },
            "transactions": [
                {"transaction_id": "TX-CR-001", "source_account": "ACC-VG-551090", "destination_account": "ACC-CY-3301", "amount": 250000.0, "timestamp": now - timedelta(hours=36), "channel": "WIRE", "description": "Intercompany Vessel Lease Advance", "country_source": "VG", "country_dest": "CY"},
                {"transaction_id": "TX-CR-002", "source_account": "ACC-CY-3301", "destination_account": "ACC-PA-9922", "amount": 245000.0, "timestamp": now - timedelta(hours=28), "channel": "WIRE", "description": "Consultancy & Port Management", "country_source": "CY", "country_dest": "PA"},
                {"transaction_id": "TX-CR-003", "source_account": "ACC-PA-9922", "destination_account": "ACC-AE-4411", "amount": 240000.0, "timestamp": now - timedelta(hours=18), "channel": "WIRE", "description": "Sub-charter Settlement", "country_source": "PA", "country_dest": "AE"},
                {"transaction_id": "TX-CR-004", "source_account": "ACC-AE-4411", "destination_account": "ACC-VG-551090", "amount": 235000.0, "timestamp": now - timedelta(hours=4), "channel": "WIRE", "description": "Dividends & Capital Return", "country_source": "AE", "country_dest": "VG"}
            ]
        },
        {
            "case_key": "CASE-MULE-03",
            "alert_id": "ALT-2026-8803",
            "customer": {
                "customer_id": "CUST-8803",
                "name": "Elena Rostova",
                "entity_type": "INDIVIDUAL",
                "pep_status": False,
                "risk_rating": "HIGH",
                "country": "US",
                "jurisdiction_risk": "LOW",
                "occupation": "Graduate Student",
                "annual_income": 28000.0,
                "adverse_media_flag": False,
                "shell_company_risk": 0.1
            },
            "account": {
                "account_number": "ACC-US-110482",
                "account_type": "CHECKING",
                "currency": "USD",
                "balance": 182000.0
            },
            "alert": {
                "alert_id": "ALT-2026-8803",
                "customer_id": "CUST-8803",
                "account_number": "ACC-US-110482",
                "alert_type": "MULE_RING",
                "severity": "HIGH",
                "risk_score": 88.0,
                "title": "Money Mule Funnel Account & High-Velocity Dispersal",
                "summary": "Large inbound wire of $180,000 immediately dispersed across 5 newly activated mule accounts.",
                "triggered_rules": ["RULE-AML-02", "RULE-AML-04"]
            },
            "transactions": [
                {"transaction_id": "TX-ML-001", "source_account": "ACC-UNKNOWN-WIRE", "destination_account": "ACC-US-110482", "amount": 180000.0, "timestamp": now - timedelta(hours=24), "channel": "WIRE", "description": "Inheritance Trust Grant", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-ML-002", "source_account": "ACC-US-110482", "destination_account": "ACC-MULE-01", "amount": 35000.0, "timestamp": now - timedelta(hours=20), "channel": "WIRE", "description": "Educational grant transfer", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-ML-003", "source_account": "ACC-US-110482", "destination_account": "ACC-MULE-02", "amount": 35000.0, "timestamp": now - timedelta(hours=18), "channel": "WIRE", "description": "Tuition allowance", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-ML-004", "source_account": "ACC-US-110482", "destination_account": "ACC-MULE-03", "amount": 35000.0, "timestamp": now - timedelta(hours=16), "channel": "WIRE", "description": "Housing deposit", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-ML-005", "source_account": "ACC-US-110482", "destination_account": "ACC-MULE-04", "amount": 35000.0, "timestamp": now - timedelta(hours=12), "channel": "WIRE", "description": "Living stipend", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-ML-006", "source_account": "ACC-US-110482", "destination_account": "ACC-MULE-05", "amount": 35000.0, "timestamp": now - timedelta(hours=8), "channel": "WIRE", "description": "Travel reimbursement", "country_source": "US", "country_dest": "US"}
            ]
        },
        {
            "case_key": "CASE-SANCTION-04",
            "alert_id": "ALT-2026-8804",
            "customer": {
                "customer_id": "CUST-8804",
                "name": "Volkov Trading Group LLC",
                "entity_type": "LLC",
                "pep_status": True,
                "risk_rating": "CRITICAL",
                "country": "RU",
                "jurisdiction_risk": "SANCTIONED",
                "occupation": "Industrial Electronics & Logistics",
                "annual_income": 3400000.0,
                "adverse_media_flag": True,
                "shell_company_risk": 0.75
            },
            "account": {
                "account_number": "ACC-RU-990144",
                "account_type": "BUSINESS",
                "currency": "USD",
                "balance": 650000.0
            },
            "alert": {
                "alert_id": "ALT-2026-8804",
                "customer_id": "CUST-8804",
                "account_number": "ACC-RU-990144",
                "alert_type": "SANCTION_HIT",
                "severity": "CRITICAL",
                "risk_score": 98.0,
                "title": "Direct OFAC SDN Sanctions Match & Evasion Flow",
                "summary": "Transaction involving OFAC designated entity Volkov Trading Group LLC under EO 14024.",
                "triggered_rules": ["RULE-AML-03"]
            },
            "transactions": [
                {"transaction_id": "TX-SN-001", "source_account": "ACC-RU-990144", "destination_account": "ACC-AE-4411", "amount": 420000.0, "timestamp": now - timedelta(hours=30), "channel": "WIRE", "description": "Payment for Industrial Micro-controllers - Volkov Trading Group", "country_source": "RU", "country_dest": "AE"},
                {"transaction_id": "TX-SN-002", "source_account": "ACC-AE-4411", "destination_account": "ACC-EU-7789", "amount": 415000.0, "timestamp": now - timedelta(hours=14), "channel": "WIRE", "description": "Component settlement invoice #8812", "country_source": "AE", "country_dest": "DE"}
            ]
        },
        {
            "case_key": "CASE-CLEAN-05",
            "alert_id": "ALT-2026-8805",
            "customer": {
                "customer_id": "CUST-8805",
                "name": "Meridian Health Technologies Inc",
                "entity_type": "CORP",
                "pep_status": False,
                "risk_rating": "LOW",
                "country": "US",
                "jurisdiction_risk": "LOW",
                "occupation": "Medical Software & Hardware",
                "annual_income": 5800000.0,
                "adverse_media_flag": False,
                "shell_company_risk": 0.05
            },
            "account": {
                "account_number": "ACC-US-334190",
                "account_type": "BUSINESS",
                "currency": "USD",
                "balance": 1200000.0
            },
            "alert": {
                "alert_id": "ALT-2026-8805",
                "customer_id": "CUST-8805",
                "account_number": "ACC-US-334190",
                "alert_type": "RAPID_VELOCITY",
                "severity": "LOW",
                "risk_score": 22.0,
                "title": "Bi-Monthly Corporate Payroll Distribution",
                "summary": "Standard bi-monthly direct deposit payroll run across 40 salaried employees.",
                "triggered_rules": []
            },
            "transactions": [
                {"transaction_id": "TX-CL-001", "source_account": "ACC-US-334190", "destination_account": "ACC-EMP-101", "amount": 4200.0, "timestamp": now - timedelta(hours=12), "channel": "ACH", "description": "Payroll Direct Deposit - Employee #101", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-CL-002", "source_account": "ACC-US-334190", "destination_account": "ACC-EMP-102", "amount": 4500.0, "timestamp": now - timedelta(hours=12), "channel": "ACH", "description": "Payroll Direct Deposit - Employee #102", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-CL-003", "source_account": "ACC-US-334190", "destination_account": "ACC-EMP-103", "amount": 3800.0, "timestamp": now - timedelta(hours=12), "channel": "ACH", "description": "Payroll Direct Deposit - Employee #103", "country_source": "US", "country_dest": "US"},
                {"transaction_id": "TX-CL-004", "source_account": "ACC-US-334190", "destination_account": "ACC-EMP-104", "amount": 4100.0, "timestamp": now - timedelta(hours=12), "channel": "ACH", "description": "Payroll Direct Deposit - Employee #104", "country_source": "US", "country_dest": "US"}
            ]
        }
    ]
    return cases
