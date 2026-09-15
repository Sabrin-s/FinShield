from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import Transaction, Account, Customer
from app.graph.network_analyzer import graph_analyzer

router = APIRouter(prefix="/graph", tags=["Network Graph"])

@router.get("/")
def get_network_graph(account_number: Optional[str] = None, limit: int = 200, db: Session = Depends(get_db)):
    """
    Returns nodes and edges formatted for interactive network graph rendering.
    """
    if account_number:
        # Find 1st & 2nd degree connected transactions
        direct_txs = db.query(Transaction).filter(
            (Transaction.source_account == account_number) | (Transaction.destination_account == account_number)
        ).all()

        nodes_set = {account_number}
        for tx in direct_txs:
            nodes_set.add(tx.source_account)
            nodes_set.add(tx.destination_account)

        txs = db.query(Transaction).filter(
            (Transaction.source_account.in_(nodes_set)) | (Transaction.destination_account.in_(nodes_set))
        ).limit(limit).all()
    else:
        txs = db.query(Transaction).limit(limit).all()

    tx_list = []
    for tx in txs:
        tx_list.append({
            "transaction_id": tx.transaction_id,
            "source_account": tx.source_account,
            "destination_account": tx.destination_account,
            "amount": tx.amount,
            "timestamp": tx.timestamp,
            "channel": tx.channel
        })

    graph_data = graph_analyzer.analyze(tx_list, target_account=account_number)
    return graph_data
