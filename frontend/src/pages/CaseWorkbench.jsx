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
  Cpu,
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

export default function CaseWorkbench({ alertId, onBack, theme }) {
  const [alertDetail, setAlertDetail] = useState(null);
  const [investigationState, setInvestigationState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'graph', 'transactions', 'sar', 'copilot'
  const isLight = theme === 'light';

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
      <div className="flex items-center justify-center h-64 font-mono text-sm font-bold animate-pulse" style={{ color: 'var(--text-main)' }}>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-main)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                {alert.alert_id}
              </span>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-main)' }}>{customer.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded border font-semibold"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-secondary)' }}>
                {customer.entity_type}
              </span>
              {customer.pep_status && (
                <span className="text-xs font-mono px-2 py-0.5 rounded border font-black"
                  style={{ backgroundColor: isLight ? '#000000' : '#ffffff', color: isLight ? '#ffffff' : '#000000', borderColor: 'var(--border-main)' }}>
                  PEP DESIGNATION
                </span>
              )}
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {alert.title} — {alert.summary}
            </p>
          </div>

          {/* Trigger Multi-Agent Swarm Button */}
          <button
            onClick={handleRunInvestigation}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border shadow-md disabled:opacity-60 cursor-pointer transition-all"
            style={{
              backgroundColor: isLight ? '#000000' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              borderColor: 'var(--border-main)'
            }}
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: isLight ? '#ffffff' : '#000000', borderTopColor: 'transparent' }}></span>
                <span>Swarm Investigating ({activeStep}/7)...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Execute 7-Agent Swarm Investigation</span>
              </>
            )}
          </button>
        </div>

        {/* Customer CDD Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Customer ID</div>
            <div className="font-bold mt-0.5 truncate" style={{ color: 'var(--text-main)' }}>{customer.customer_id}</div>
          </div>

          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Subject Account</div>
            <div className="font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>{account.account_number}</div>
          </div>

          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Jurisdiction</div>
            <div className="font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>{customer.jurisdiction_risk} ({customer.country})</div>
          </div>

          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Declared Revenue</div>
            <div className="font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>${customer.annual_income?.toLocaleString()}</div>
          </div>

          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Shell Probability</div>
            <div className="font-black mt-0.5" style={{ color: 'var(--text-main)' }}>{Math.round((customer.shell_company_risk || 0) * 100)}%</div>
          </div>

          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Balance Monitored</div>
            <div className="font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>${account.balance?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b pb-1 overflow-x-auto" style={{ borderColor: 'var(--border-main)' }}>
        {[
          { id: 'overview', label: 'Multi-Agent Pipeline & Risk' },
          { id: 'graph', label: 'Entity Network Graph' },
          { id: 'transactions', label: `Forensic Ledger (${alertDetail?.transactions?.length || alertDetail?.transactions_count || 0})` },
          { id: 'sar', label: 'Suspicious Activity Report (SAR)' },
          { id: 'copilot', label: 'Investigator Copilot AI' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-t-lg text-xs font-bold transition border-t border-x cursor-pointer"
              style={{
                backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                borderColor: isActive ? 'var(--border-main)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--text-main)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview (Agent Timeline + Risk Radar) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {!investigationState && !isRunning && (
            <div className="p-4 rounded-xl border flex items-center justify-between gap-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                    {alert.alert_type === 'BATCH_UPLOAD' ? 'Uploaded Transactions Ready for Investigation' : 'Case Transactions Ingested'}
                  </h4>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {alertDetail?.transactions?.length || alertDetail?.transactions_count || 0} financial records loaded. Click the black/white button above to trigger the 7-agent swarm.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer hover:underline shrink-0"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
              >
                View Ledger &rarr;
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentExecutionVisualizer 
              agentLogs={investigationState?.agent_logs || []}
              isRunning={isRunning}
              activeStep={activeStep}
              theme={theme}
            />
            <div className="space-y-6">
              <RiskRadar 
                riskAssessment={investigationState?.risk_assessment || {
                  overall_risk_score: alert.risk_score,
                  risk_tier: alert.severity === 'CRITICAL' ? 'CRITICAL_SUSPICION' : 'HIGH_RISK',
                  recommendation: 'EXECUTE_SWARM_INVESTIGATION',
                  factor_breakdown: []
                }}
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Network Graph */}
      {activeTab === 'graph' && (
        <NetworkGraph 
          graphData={investigationState?.graph_findings || {}}
          targetAccount={account.account_number}
          theme={theme}
        />
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <TransactionTable 
          transactions={investigationState?.transaction_findings?.all_scored_transactions || alertDetail?.transactions || []}
          targetAccount={account.account_number}
          theme={theme}
        />
      )}

      {/* Tab 4: SAR Report */}
      {activeTab === 'sar' && (
        <SARNarrativeViewer 
          sarDraft={investigationState?.sar_draft}
          theme={theme}
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
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
