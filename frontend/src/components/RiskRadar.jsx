import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export default function RiskRadar({ riskAssessment = {} }) {
  const score = riskAssessment.overall_risk_score || 0;
  const tier = riskAssessment.risk_tier || 'LOW_RISK';
  const factors = riskAssessment.factor_breakdown || [];
  const recommendation = riskAssessment.recommendation || 'MONITOR';

  const getTierColor = (t) => {
    if (t === 'CRITICAL_SUSPICION' || t === 'CRITICAL') return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (t === 'HIGH_RISK' || t === 'HIGH') return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    if (t === 'MEDIUM_RISK' || t === 'MEDIUM') return 'text-sky-400 border-sky-500/40 bg-sky-950/40';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Explainable AML Risk Factor Decomposition</h3>
            <p className="text-xs text-slate-400">SHAP-inspired feature attribution & composite risk index</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getTierColor(tier)}`}>
          {tier.replace('_', ' ')}
        </div>
      </div>

      {/* Main Score Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 items-center">
        <div className="text-center md:border-r border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Composite Score</div>
          <div className="text-4xl font-extrabold font-mono text-white flex items-center justify-center gap-1">
            <span className={score >= 70 ? 'text-rose-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'}>
              {score}
            </span>
            <span className="text-slate-400 text-lg">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Confidence: <strong className="text-cyan-400">{Math.round((riskAssessment.confidence_score || 0.94) * 100)}%</strong>
          </div>
        </div>

        <div className="md:col-span-2 space-y-1.5 pl-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recommended Compliance Action</span>
          </div>
          <div className="text-xs text-slate-300 font-mono p-2 rounded bg-slate-950 border border-slate-800">
            {recommendation.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Factors List */}
      <div className="space-y-3 pt-1">
        {factors.map((factor, idx) => {
          const isHigh = factor.impact === 'HIGH';
          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{factor.category}</span>
                <span className="font-mono text-slate-300 font-bold">
                  {factor.score} <span className="text-slate-400 font-normal">/ {factor.max_score} pts</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (factor.score / factor.max_score) * 100)}%` }}
                ></div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>{factor.evidence}</span>
                <span className={isHigh ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {factor.impact} IMPACT
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
