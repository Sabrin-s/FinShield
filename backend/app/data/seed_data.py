import json
from app.db.database import engine, Base, SessionLocal
from app.db.models import Customer, Account, Transaction, Alert, SanctionEntity, AMLTypologyDoc
from app.data.synthetic_cases import get_synthetic_cases
from app.agents.sanction_agent import WATCHLIST_ENTITIES
from app.rag.vector_store import typology_store

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Customer).count() > 0:
            print("Database already contains data. Skipping initial seed.")
            return

        print("Seeding FinGuard AI database with realistic AML forensic scenarios...")

        # 1. Seed Sanctions Watchlist
        for se in WATCHLIST_ENTITIES:
            entity_record = SanctionEntity(
                name=se["name"],
                entity_type=se.get("type", "ENTITY"),
                program=se.get("program", "OFAC"),
                country=se.get("country", "GLOBAL"),
                aliases=json.dumps(se.get("alias", [])),
                notes="Designated on high-risk sanctions registry"
            )
            db.add(entity_record)

        # 2. Seed AML Regulatory Typologies
        for doc in typology_store.get_all_typologies():
            typology_record = AMLTypologyDoc(
                typology_id=doc["id"],
                category=doc["category"],
                title=doc["title"],
                description=doc["description"],
                red_flags=json.dumps(doc.get("red_flags", [])),
                regulatory_source=doc.get("regulatory_source", "FATF / FinCEN"),
                fatf_indicator=doc.get("fatf_indicator")
            )
            db.add(typology_record)

        # 3. Seed Synthetic Cases, Customers, Accounts, Alerts, Transactions
        cases = get_synthetic_cases()
        for case in cases:
            c_data = case["customer"]
            customer = Customer(
                customer_id=c_data["customer_id"],
                name=c_data["name"],
                entity_type=c_data["entity_type"],
                pep_status=c_data["pep_status"],
                risk_rating=c_data["risk_rating"],
                country=c_data["country"],
                jurisdiction_risk=c_data["jurisdiction_risk"],
                occupation=c_data.get("occupation"),
                annual_income=c_data.get("annual_income", 75000.0),
                adverse_media_flag=c_data.get("adverse_media_flag", False),
                shell_company_risk=c_data.get("shell_company_risk", 0.0)
            )
            db.add(customer)

            a_data = case["account"]
            account = Account(
                account_number=a_data["account_number"],
                customer_id=c_data["customer_id"],
                account_type=a_data["account_type"],
                currency=a_data["currency"],
                balance=a_data["balance"]
            )
            db.add(account)

            alt_data = case["alert"]
            alert = Alert(
                alert_id=alt_data["alert_id"],
                customer_id=c_data["customer_id"],
                account_number=alt_data["account_number"],
                alert_type=alt_data["alert_type"],
                severity=alt_data["severity"],
                risk_score=alt_data["risk_score"],
                status="OPEN",
                title=alt_data["title"],
                summary=alt_data["summary"],
                triggered_rules=json.dumps(alt_data.get("triggered_rules", []))
            )
            db.add(alert)

            for tx_data in case["transactions"]:
                tx = Transaction(
                    transaction_id=tx_data["transaction_id"],
                    source_account=tx_data["source_account"],
                    destination_account=tx_data["destination_account"],
                    amount=tx_data["amount"],
                    timestamp=tx_data["timestamp"],
                    channel=tx_data["channel"],
                    description=tx_data.get("description"),
                    country_source=tx_data.get("country_source", "US"),
                    country_dest=tx_data.get("country_dest", "US"),
                    is_suspicious=bool(alt_data["severity"] in ["HIGH", "CRITICAL"]),
                    typology_tag=alt_data["alert_type"]
                )
                db.add(tx)

        db.commit()
        print("FinGuard AI database successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
