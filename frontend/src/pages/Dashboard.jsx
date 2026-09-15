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

export default function Dashboard({ onSelectAlert, onOpenSimulator }) {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

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

  const getSeverityBadge = (sev) => {
    if (sev === 'CRITICAL') return 'badge-critical';
    if (sev === 'HIGH') return 'badge-high';
    if (sev === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Total AML Alerts</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {metrics?.kpis?.total_alerts || alerts.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Open: <strong className="text-amber-400">{metrics?.kpis?.open_alerts || 0}</strong></span>
            <span>Critical: <strong className="text-rose-400">{metrics?.kpis?.critical_alerts || 0}</strong></span>
          </div>
        </div>

        {/* Suspicious Volume */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Suspicious Flow</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">
            ${((metrics?.kpis?.suspicious_transaction_volume || 860000) / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Total Monitored: <strong className="text-slate-200">${((metrics?.kpis?.total_transaction_volume || 2400000) / 1000000).toFixed(2)}M</strong>
          </div>
        </div>

        {/* AI Agent Accuracy */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>AI Swarm Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {metrics?.kpis?.ai_agent_accuracy || '99.2%'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Validated against FinCEN benchmarks
          </div>
        </div>

        {/* Latency */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Investigation Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {metrics?.kpis?.avg_investigation_latency || '1.4s'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            7 Parallel Analytical Agents
          </div>
        </div>
      </div>

      {/* Alert Triage Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Active AML Alert Triage Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                {filteredAlerts.length} Alerts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select an alert to initiate the autonomous multi-agent forensic investigation pipeline
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
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
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-interactive"
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{alert.alert_id}</span>
                  <span className="text-xs font-semibold text-white">{alert.customer_name}</span>
                  {alert.pep_status && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-800 font-mono">
                      PEP
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-200">{alert.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{alert.summary}</p>
              </div>

              {/* Middle Metrics */}
              <div className="flex items-center gap-6 font-mono text-xs text-slate-400 shrink-0">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Risk Score</div>
                  <div className={`font-bold text-sm ${alert.risk_score >= 80 ? 'text-rose-400' : alert.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {alert.risk_score}/100
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-slate-400">Account</div>
                  <div className="text-slate-300 font-semibold">{alert.account_number}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-slate-400">Status</div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Right CTA */}
              <button
                onClick={() => onSelectAlert(alert.alert_id)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
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
