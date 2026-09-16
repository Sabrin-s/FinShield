# FinGuard AI — Multi-Agent AML Investigation & Financial Risk Intelligence Platform

Deploy Link - https://fin-shield-sigma.vercel.app/

FinGuard AI is a multi-agent Anti-Money Laundering (AML) forensic copilot and financial risk intelligence platform. It replaces black-box LLM decisions with an **explainable, multimodal multi-agent architecture** that combines machine learning anomaly detection, graph network cycle analysis, deterministic AML rule heuristics, vector-based regulatory RAG search, and automated audit-ready Suspicious Activity Report (SAR) generation.

---

## Architecture & Multi-Agent Swarm

```
                             ┌───────────────────────────────┐
                             │       Incoming Alert /        │
                             │     Case Trigger (API/UI)     │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │   Planner Agent (LangGraph)   │
                             │  Deconstructs Case & Hypotheses│
                             └───────┬───────┬───────┬───────┘
                                     │       │       │
             ┌───────────────────────┘       │       └────────────────────────┐
             ▼                               ▼                                ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│    Transaction Agent    │     │      KYC & Entity       │     │   Document & Sanction   │
│  - Structuring/Velocity │     │  - PEP & Risk Rating    │     │  - OFAC/SDN Matching    │
│  - Anomaly ML (IsoForest)│    │  - Shell Company Opacity│     │  - Adverse Media Hits   │
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  Graph Network Engine   │
                        │ - NetworkX Loop/Mule Ring│
                        │ - Centrality & Flow Path│
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │ Fraud/AML Risk Engine   │
                        │ - Explainable Scoring   │
                        │ - Risk Factor Waterfall │
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │   Evidence + RAG Agent  │
                        │ - FATF / FinCEN Vector  │
                        │ - Typology Citations    │
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  SAR Generator Agent    │
                        │ - Audit-Ready Narrative │
                        │ - Suspicious Activity Rpt│
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  React Dark Dashboard   │
                        │  Interactive Workbench  │
                        └─────────────────────────┘
```

---

## 7 Specialized Agents

| Agent | Responsibility | Core Technology |
|---|---|---|
| **1. Planner Agent** | Formulates forensic investigation scope and 4 investigative hypotheses. | StateGraph Orchestration |
| **2. Transaction Agent** | Analyzes ledger cash flows, detects velocity bursts & structuring ($8.5k-$9.9k). | `IsolationForest` ML + Heuristics |
| **3. KYC & Entity Agent** | Evaluates PEP status, corporate opacity, jurisdiction risk, and shell company flags. | Customer Due Diligence (CDD) Model |
| **4. Sanction & Document Agent** | Screens subjects and counterparties against OFAC SDN, EU, and UN registries. | Fuzzy N-Gram Entity Matching |
| **5. Fraud/AML Risk Engine** | Fuses tabular ML + graph metrics into an explainable 0-100 risk score and factor breakdown. | Explainability Factor Engine + `NetworkX` |
| **6. Evidence + RAG Agent** | Semantically queries regulatory AML vector database for FATF 40 Recommendations and FinCEN red flags. | TF-IDF / Cosine Similarity Vector Store |
| **7. SAR Generator Agent** | Drafts complete, audit-ready formal Suspicious Activity Report (FinCEN Form 111 compliant). | Regulatory Compliance Drafting Engine |

---

## Key Capabilities & Technologies

- **Python & FastAPI**: High-performance RESTful APIs, Server-Sent Events (SSE) streaming, structured Pydantic schemas.
- **Machine Learning & Anomaly Detection**: Scikit-Learn `IsolationForest` scoring and statistical amount outlier z-score detection.
- **Graph Analytics (`NetworkX`)**: Automatic circular flow cycle detection ($A \to B \to C \to A$), mule fan-in / fan-out hub identification, and PageRank centrality scoring.
- **Regulatory RAG Vector Database**: Semantic matching against FATF Red Flags, FinCEN Advisories, and BSA 31 U.S.C. 5324 regulations.
- **Explainability**: SHAP-inspired risk factor waterfall breakdown with transparent score justification.
- **Modern React Dashboard**: Dark-mode fintech UI, interactive HTML5 Canvas entity network visualizer, live threat simulator, and SAR studio.
- **Docker & Automated Tests**: Full `pytest` test suite with 100% pass rate and `docker-compose` orchestration.

---

## Quick Start Guide

### Option 1: One-Click Startup (Windows)
```cmd
run.bat
```

### Option 2: Linux / macOS Startup
```bash
chmod +x run.sh
./run.sh
```

### Option 3: Manual Execution

#### 1. Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be live at: `http://localhost:5173`

---

## Running Automated Tests

```bash
cd backend
python -m pytest tests/
```
Output:
```
tests/test_agents.py ..  [18%]
tests/test_api.py ....   [54%]
tests/test_graph.py ..   [72%]
tests/test_ml.py ...     [100%]
======================= 11 passed in 1.85s =======================
```

---

## Live Threat Simulator

FinGuard AI includes a built-in **Live AML Threat Simulator** accessible directly from the dashboard. You can instantly inject complex topologies:
1. **Structuring & Smurfing Ring**: 6 below-threshold deposits ($9,150–$9,800) triggering CTR evasion alerts.
2. **Circular Round-Trip Pass-Through**: 4-hop offshore shell company cycle returning $450,000 principal.
3. **Money Mule Ring**: $180,000 inbound wire rapidly dispersed across 5 mule accounts.

Once injected, trigger the **7-Agent Swarm** to watch the real-time detection, graph visualization, and SAR drafting live!

---

## Production Deployment Guide (Frontend on Vercel + Backend on Render)

### 1. Deploy Backend to Render (FastAPI)

1. Sign in to [Render Dashboard](https://dashboard.render.com/) and click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `finguard-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `PYTHON_VERSION` = `3.10.8`
   - `ENVIRONMENT` = `production`
   - *(Optional)* `OPENAI_API_KEY` or `GROQ_API_KEY` (system defaults to local heuristics if omitted)
5. Click **Deploy Web Service**. Once active, note your live backend URL (e.g. `https://finguard-backend.onrender.com`).

---

### 2. Deploy Frontend to Vercel (React + Vite)

1. Sign in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** &rarr; **Project**.
2. Import your GitHub repository.
3. In project configuration:
   - **Root Directory**: Click **Edit** and choose `frontend`
   - **Framework Preset**: `Vite` (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://finguard-backend.onrender.com` *(replace with your Render backend URL)*
5. Click **Deploy**. Vercel will build and assign a global production URL (e.g. `https://finguard-frontend.vercel.app`).

