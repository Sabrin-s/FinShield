import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any

class TransactionAnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        self.is_fitted = False
        self._bootstrap_default_model()

    def _bootstrap_default_model(self):
        # Generate baseline standard banking transaction features
        # Features: [amount, velocity_24h, hour_of_day, log_amount, ratio_to_avg]
        np.random.seed(42)
        n_samples = 1500
        
        amounts = np.random.exponential(scale=350, size=n_samples) + np.random.normal(50, 15, size=n_samples)
        amounts = np.clip(amounts, 5.0, 5000.0)
        velocities = np.random.poisson(lam=1.5, size=n_samples)
        hours = np.random.randint(8, 20, size=n_samples)
        log_amounts = np.log1p(amounts)
        ratio_to_avg = amounts / np.mean(amounts)
        
        X = np.column_stack([amounts, velocities, hours, log_amounts, ratio_to_avg])
        self.model.fit(X)
        self.is_fitted = True

    def extract_features(self, transactions: List[Dict[str, Any]], customer_avg_amount: float = 500.0) -> np.ndarray:
        features = []
        for tx in transactions:
            amount = float(tx.get("amount", 0.0))
            velocity = float(tx.get("velocity_count", 1.0))
            
            # Timestamp parsing or default hour
            hour = 12
            if "timestamp" in tx and hasattr(tx["timestamp"], "hour"):
                hour = tx["timestamp"].hour
            
            log_amount = np.log1p(amount)
            ratio = amount / max(customer_avg_amount, 1.0)
            
            features.append([amount, velocity, hour, log_amount, ratio])
        
        return np.array(features) if features else np.empty((0, 5))

    def detect_anomalies(self, transactions: List[Dict[str, Any]], customer_avg_amount: float = 500.0) -> List[Dict[str, Any]]:
        """
        Runs IsolationForest scoring + statistical z-score on transactions list.
        Returns transactions with anomaly scores (0 to 100) and is_anomaly flags.
        """
        if not transactions:
            return []

        X = self.extract_features(transactions, customer_avg_amount)
        if X.shape[0] == 0:
            return transactions

        # Isolation forest decision function (lower means more anomalous)
        raw_scores = self.model.decision_function(X)
        predictions = self.model.predict(X) # -1 for anomaly, 1 for normal

        results = []
        for i, tx in enumerate(transactions):
            tx_copy = dict(tx)
            # Normalize anomaly score from raw decision function (-0.5 to 0.5 typical) to 0-100 scale
            # Invert: Lower decision function -> higher anomaly score
            raw_score = raw_scores[i]
            norm_anomaly_score = max(0.0, min(100.0, (0.25 - raw_score) * 120.0))
            
            # Statistical amount threshold check
            amount = float(tx.get("amount", 0.0))
            if amount > customer_avg_amount * 5.0 and amount > 5000:
                norm_anomaly_score = max(norm_anomaly_score, 82.0)
                
            tx_copy["anomaly_score"] = round(norm_anomaly_score, 2)
            tx_copy["is_anomaly"] = bool(predictions[i] == -1 or norm_anomaly_score >= 70.0)
            results.append(tx_copy)

        return results

anomaly_detector = TransactionAnomalyDetector()
