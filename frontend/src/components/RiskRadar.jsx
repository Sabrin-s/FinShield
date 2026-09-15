import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function RiskRadar({ riskAssessment = {}, theme }) {
  const score = riskAssessment.overall_risk_score || 0;
  const tier = riskAssessment.risk_tier || 'LOW_RISK';
  const factors = riskAssessment.factor_breakdown || [];
  const recommendation = riskAssessment.recommendation || 'MONITOR';

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Explainable AML Risk Decomposition</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Factor attribution & composite risk index</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
          {tier.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Main Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-4 items-center"
        style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
        <div className="text-center md:border-r" style={{ borderColor: 'var(--border-main)' }}>
          <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Composite Score</div>
          <div className="text-4xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
            {score}<span className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="text-[11px] mt-1 font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            Confidence: <strong style={{ color: 'var(--text-main)' }}>{Math.round((riskAssessment.confidence_score || 0.94) * 100)}%</strong>
          </div>
        </div>
        <div className="md:col-span-2 space-y-1.5 pl-2">
          <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
            <Info className="w-3.5 h-3.5" />
            <span>Recommended Compliance Action</span>
          </div>
          <div className="text-xs font-mono font-bold p-2 rounded border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            {recommendation.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-3 pt-1">
        {factors.map((factor, idx) => {
          const pct = Math.min(100, (factor.score / factor.max_score) * 100);
          return (
            <div key={idx} className="p-3 rounded-lg border space-y-1.5"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-main)' }}>{factor.category}</span>
                <span className="font-mono font-bold" style={{ color: 'var(--text-main)' }}>
                  {factor.score} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>/ {factor.max_score} pts</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-main)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: 'var(--text-main)' }}></div>
              </div>
              <div className="text-[11px] flex items-center justify-between font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
                <span>{factor.evidence}</span>
                <span className="font-bold" style={{ color: 'var(--text-main)' }}>{factor.impact} IMPACT</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
