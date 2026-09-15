import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  User, 
  Building2, 
  Globe, 
  DollarSign,
  Sparkles,
  Bot,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import AgentExecutionVisualizer from '../components/AgentExecutionVisualizer';
import NetworkGraph from '../components/NetworkGraph';
import RiskRadar from '../components/RiskRadar';
import TransactionTable from '../components/TransactionTable';
import SARNarrativeViewer from '../components/SARNarrativeViewer';
import CopilotChat from '../components/CopilotChat';

export default function CaseWorkbench({ alertId, onBack }) {
  const [alertDetail, setAlertDetail] = useState(null);
  const [investigationState, setInvestigationState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'graph', 'transactions', 'sar', 'copilot'

  useEffect(() => {
    if (alertId) {
      loadAlert();
    }
  }, [alertId]);

  const loadAlert = async () => {
    setLoading(true);
    try {
      const data = await api.getAlertDetail(alertId);
      setAlertDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvestigation = async () => {
    setIsRunning(true);
    setActiveStep(1);

    // Simulate animated step progression
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= 7) {
          clearInterval(interval);
          return 7;
        }
        return prev + 1;
      });
    }, 450);

    try {
      const state = await api.runInvestigation(alertId);
      setInvestigationState(state);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setIsRunning(false);
      setActiveStep(7);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-400 font-mono text-sm animate-pulse">
        Loading case evidence and customer profile...
      </div>
    );
  }

  const customer = alertDetail?.customer || {};
  const alert = alertDetail?.alert || {};
  const account = alertDetail?.account || {};

  return (
    <div className="space-y-6">
      {/* Top Case Header & CDD Summary */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                {alert.alert_id}
              </span>
              <h2 className="text-lg font-bold text-white">{customer.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {customer.entity_type}
              </span>
              {customer.pep_status && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  PEP DESIGNATION
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{alert.title} — {alert.summary}</p>
          </div>

          {/* Trigger Multi-Agent Swarm Button */}
          <button
            onClick={handleRunInvestigation}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 border border-cyan-400/40 disabled:opacity-60 cursor-pointer"
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Swarm Investigating ({activeStep}/7)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Execute 7-Agent Swarm Investigation</span>
              </>
            )}
          </button>
        </div>

        {/* Customer CDD Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Customer ID</div>
            <div className="text-slate-200 font-bold mt-0.5 truncate">{customer.customer_id}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Subject Account</div>
            <div className="text-cyan-400 font-bold mt-0.5">{account.account_number}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Jurisdiction Risk</div>
            <div className="text-amber-400 font-bold mt-0.5">{customer.jurisdiction_risk} ({customer.country})</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Declared Revenue</div>
            <div className="text-emerald-400 font-bold mt-0.5">${customer.annual_income?.toLocaleString()}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Shell Probability</div>
            <div className="text-rose-400 font-bold mt-0.5">{Math.round((customer.shell_company_risk || 0) * 100)}%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Balance Monitored</div>
            <div className="text-slate-200 font-bold mt-0.5">${account.balance?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        {[
          { id: 'overview', label: 'Multi-Agent Pipeline & Risk' },
          { id: 'graph', label: 'Entity Network Graph' },
          { id: 'transactions', label: 'Forensic Ledger' },
          { id: 'sar', label: 'Suspicious Activity Report (SAR)' },
          { id: 'copilot', label: 'Investigator Copilot AI' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-cyan-950/60 text-cyan-300 border-b-2 border-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview (Agent Timeline + Risk Radar) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentExecutionVisualizer 
            agentLogs={investigationState?.agent_logs || []}
            isRunning={isRunning}
            activeStep={activeStep}
          />
          <div className="space-y-6">
            <RiskRadar 
              riskAssessment={investigationState?.risk_assessment || {
                overall_risk_score: alert.risk_score,
                risk_tier: alert.severity === 'CRITICAL' ? 'CRITICAL_SUSPICION' : 'HIGH_RISK',
                recommendation: 'EXECUTE_SWARM_INVESTIGATION',
                factor_breakdown: []
              }}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Network Graph */}
      {activeTab === 'graph' && (
        <NetworkGraph 
          graphData={investigationState?.graph_findings || {}}
          targetAccount={account.account_number}
        />
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <TransactionTable 
          transactions={investigationState?.transaction_findings?.all_scored_transactions || []}
          targetAccount={account.account_number}
        />
      )}

      {/* Tab 4: SAR Report */}
      {activeTab === 'sar' && (
        <SARNarrativeViewer 
          sarDraft={investigationState?.sar_draft}
        />
      )}

      {/* Tab 5: Copilot */}
      {activeTab === 'copilot' && (
        <div className="max-w-3xl mx-auto">
          <CopilotChat 
            caseContext={{
              customer_name: customer.name,
              alert_type: alert.alert_type,
              risk_score: alert.risk_score
            }}
          />
        </div>
      )}
    </div>
  );
}
