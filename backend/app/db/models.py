from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.db.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    entity_type = Column(String, default="INDIVIDUAL") # INDIVIDUAL, LLC, CORP, TRUST
    pep_status = Column(Boolean, default=False)
    risk_rating = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    country = Column(String, default="US")
    jurisdiction_risk = Column(String, default="LOW") # LOW, MEDIUM, HIGH, SANCTIONED
    occupation = Column(String, nullable=True)
    annual_income = Column(Float, default=75000.0)
    adverse_media_flag = Column(Boolean, default=False)
    shell_company_risk = Column(Float, default=0.0) # 0.0 to 1.0
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="customer")
    alerts = relationship("Alert", back_populates="customer")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.customer_id"), nullable=False)
    account_type = Column(String, default="CHECKING") # CHECKING, SAVINGS, BUSINESS, CRYPTO_GATEWAY, OFFSHORE
    currency = Column(String, default="USD")
    balance = Column(Float, default=10000.0)
    status = Column(String, default="ACTIVE")
    opened_date = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="accounts")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True, nullable=False)
    source_account = Column(String, index=True, nullable=False)
    destination_account = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    channel = Column(String, default="WIRE") # WIRE, ACH, CASH_DEPOSIT, CRYPTO, ATM
    description = Column(String, nullable=True)
    country_source = Column(String, default="US")
    country_dest = Column(String, default="US")
    is_suspicious = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    typology_tag = Column(String, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.customer_id"), nullable=False)
    account_number = Column(String, nullable=False)
    alert_type = Column(String, nullable=False) # STRUCTURING, CIRCULAR_FLOW, RAPID_VELOCITY, SANCTION_HIT, MULE_RING, SHELL_LAYERING
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=75.0)
    status = Column(String, default="OPEN") # OPEN, IN_INVESTIGATION, CLOSED_SAR_FILED, CLOSED_FALSE_POSITIVE
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    triggered_rules = Column(Text, default="[]") # JSON list of rules
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="alerts")

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True, nullable=False)
    alert_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    status = Column(String, default="IN_PROGRESS") # IN_PROGRESS, COMPLETED, REVIEWED
    overall_risk_score = Column(Float, default=0.0)
    typology_detected = Column(String, nullable=True)
    findings_json = Column(Text, default="{}") # Full structured agent outputs
    agent_steps_json = Column(Text, default="[]") # Step by step log for visualization
    sar_report_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class SARReport(Base):
    __tablename__ = "sar_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True, nullable=False)
    case_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    filing_type = Column(String, default="INITIAL_SUSPICIOUS_ACTIVITY_REPORT")
    narrative = Column(Text, nullable=False)
    typologies_json = Column(Text, default="[]")
    evidence_json = Column(Text, default="[]")
    recommended_actions_json = Column(Text, default="[]")
    status = Column(String, default="DRAFT") # DRAFT, APPROVED, FILED
    created_at = Column(DateTime, default=datetime.utcnow)

class SanctionEntity(Base):
    __tablename__ = "sanction_entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    entity_type = Column(String, default="INDIVIDUAL") # INDIVIDUAL, ENTITY, VESSEL
    program = Column(String, default="SDNTK") # OFAC, EU_SANCTIONS, UN_SANCTIONS
    country = Column(String, default="UNKNOWN")
    aliases = Column(Text, default="[]")
    notes = Column(Text, nullable=True)

class AMLTypologyDoc(Base):
    __tablename__ = "aml_typology_docs"

    id = Column(Integer, primary_key=True, index=True)
    typology_id = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False) # PLACEMENT, LAYERING, INTEGRATION, TERRORIST_FINANCING, SANCTIONS
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    red_flags = Column(Text, default="[]")
    regulatory_source = Column(String, default="FATF / FinCEN")
    fatf_indicator = Column(String, nullable=True)
