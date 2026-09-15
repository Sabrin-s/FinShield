import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  PlayCircle, 
  Search, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onSelectAlert, onOpenSimulator, theme }) {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const isLight = theme === 'light';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAlerts()
      ]);
      setMetrics(m);
      setAlerts(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>Total AML Alerts</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
            {metrics?.kpis?.total_alerts || alerts.length}
          </div>
          <div className="text-[11px] flex items-center justify-between font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span>Open: <strong style={{ color: 'var(--text-main)' }}>{metrics?.kpis?.open_alerts || 0}</strong></span>
            <span>Critical: <strong style={{ color: 'var(--text-main)' }}>{metrics?.kpis?.critical_alerts || 0}</strong></span>
          </div>
        </div>

        {/* Suspicious Volume */}
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>Suspicious Flow</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
            ${((metrics?.kpis?.suspicious_transaction_volume || 860000) / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            Total Monitored: <strong style={{ color: 'var(--text-main)' }}>${((metrics?.kpis?.total_transaction_volume || 2400000) / 1000000).toFixed(2)}M</strong>
          </div>
        </div>

        {/* AI Agent Accuracy */}
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>AI Swarm Accuracy</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
            {metrics?.kpis?.ai_agent_accuracy || '99.2%'}
          </div>
          <div className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            Validated against FinCEN benchmarks
          </div>
        </div>

        {/* Latency */}
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>Investigation Latency</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
            {metrics?.kpis?.avg_investigation_latency || '1.4s'}
          </div>
          <div className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            7 Parallel Analytical Agents
          </div>
        </div>
      </div>

      {/* Alert Triage Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border-main)' }}>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <span>Active AML Alert Triage Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono border font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
                {filteredAlerts.length} Alerts
              </span>
            </h2>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Select an alert to initiate the autonomous multi-agent forensic investigation pipeline
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition border cursor-pointer ${
                  severityFilter === sev
                    ? 'border-black dark:border-white shadow-sm'
                    : 'border-slate-300 dark:border-zinc-800'
                }`}
                style={{
                  backgroundColor: severityFilter === sev ? (isLight ? '#000000' : '#ffffff') : 'var(--bg-card)',
                  color: severityFilter === sev ? (isLight ? '#ffffff' : '#000000') : 'var(--text-main)'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-interactive"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)'
              }}
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>{alert.alert_id}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{alert.customer_name}</span>
                  {alert.pep_status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                      style={{
                        backgroundColor: isLight ? '#f4f4f5' : '#18181b',
                        borderColor: 'var(--border-main)',
                        color: 'var(--text-main)'
                      }}
                    >
                      PEP ACTIVE
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{alert.title}</h4>
                <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--text-muted)' }}>{alert.summary}</p>
              </div>

              {/* Middle Metrics */}
              <div className="flex items-center gap-6 font-mono text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                <div>
                  <div className="text-[10px] uppercase font-bold">Risk Score</div>
                  <div className="font-black text-sm" style={{ color: 'var(--text-main)' }}>
                    {alert.risk_score}/100
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold">Account</div>
                  <div className="font-bold" style={{ color: 'var(--text-main)' }}>{alert.account_number}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold">Status</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Right CTA */}
              <button
                onClick={() => onSelectAlert(alert.alert_id)}
                className="px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shrink-0 border cursor-pointer transition-all"
                style={{
                  backgroundColor: isLight ? '#000000' : '#ffffff',
                  color: isLight ? '#ffffff' : '#000000',
                  borderColor: 'var(--border-main)'
                }}
              >
                <span>Investigate Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
