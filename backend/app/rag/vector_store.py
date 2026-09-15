import json
import os
import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class TypologyVectorStore:
    def __init__(self, typologies_path: str = None):
        if typologies_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            typologies_path = os.path.join(base_dir, "typologies.json")
        
        self.typologies_path = typologies_path
        self.documents: List[Dict[str, Any]] = []
        self.corpus: List[str] = []
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = None
        self._load_and_index()

    def _load_and_index(self):
        if not os.path.exists(self.typologies_path):
            return

        with open(self.typologies_path, "r", encoding="utf-8") as f:
            self.documents = json.load(f)

        self.corpus = []
        for doc in self.documents:
            text = f"{doc.get('title', '')} {doc.get('category', '')} {doc.get('description', '')} " \
                   f"{' '.join(doc.get('red_flags', []))} {doc.get('regulatory_source', '')}"
            self.corpus.append(text)

        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        RAG vector search: computes semantic relevance between query and regulatory AML catalog.
        """
        if not self.corpus or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        ranked_indices = scores.argsort()[::-1][:top_k]
        
        results = []
        for idx in ranked_indices:
            score = float(scores[idx])
            if score > 0.05: # Relevance threshold
                doc = dict(self.documents[idx])
                doc["relevance_score"] = round(score, 4)
                
                # Highlight matching red flags
                query_tokens = set(re.findall(r'\w+', query.lower()))
                matched_flags = []
                for rf in doc.get("red_flags", []):
                    rf_tokens = set(re.findall(r'\w+', rf.lower()))
                    if len(query_tokens.intersection(rf_tokens)) >= 2:
                        matched_flags.append(rf)
                
                doc["matched_red_flags"] = matched_flags if matched_flags else doc.get("red_flags", [])[:2]
                results.append(doc)

        return results

    def get_all_typologies(self) -> List[Dict[str, Any]]:
        return self.documents

# Global singleton
typology_store = TypologyVectorStore()
