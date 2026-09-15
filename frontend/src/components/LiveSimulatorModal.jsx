import React, { useState } from 'react';
import { PlayCircle, X, Zap, Repeat, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const SCENARIOS = [
  { id: "SMURFING_INJECTION", title: "Structuring & Smurfing Ring", subtitle: "Below $10,000 threshold cash bursts", icon: Zap, description: "Generates 6 rapid branch cash deposits between $9,150 and $9,800 to evade CTR reporting limits." },
  { id: "CIRCULAR_INJECTION", title: "Circular Round-Trip Pass-Through", subtitle: "4-Hop offshore shell routing", icon: Repeat, description: "Injects multi-jurisdiction loop laundering $450,000 with 95% principal returned." }
];

export default function LiveSimulatorModal({ isOpen, onClose, onInjected, theme }) {
  const [selectedScenario, setSelectedScenario] = useState('SMURFING_INJECTION');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handleInject = async () => {
    setLoading(true); setResult(null);
    try { const res = await api.injectScenario(selectedScenario); setResult(res); if (onInjected) onInjected(res); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="max-w-lg w-full p-6 shadow-2xl space-y-5 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Live AML Threat Simulator</h3>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Inject complex money laundering topologies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2.5">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;
            return (
              <div key={sc.id} onClick={() => setSelectedScenario(sc.id)}
                className="p-4 rounded-xl border cursor-pointer transition-all"
                style={{
                  backgroundColor: isSelected ? (isLight ? '#000' : '#fff') : 'var(--bg-card)',
                  borderColor: isSelected ? 'transparent' : 'var(--border-main)',
                  color: isSelected ? (isLight ? '#fff' : '#000') : 'var(--text-main)'
                }}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <h4 className="text-xs font-bold">{sc.title}</h4>
                    <p className="text-[11px] font-mono font-semibold" style={{ opacity: 0.7 }}>{sc.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs mt-2 leading-relaxed font-medium" style={{ opacity: 0.8 }}>{sc.description}</p>
              </div>
            );
          })}
        </div>

        {result && (
          <div className="p-3 rounded-lg border text-xs font-mono font-bold flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Alert #{result.alert_id} generated!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>Cancel</button>
          <button onClick={handleInject} disabled={loading}
            className="px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60 border"
            style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
            {loading ? (<><span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: isLight ? '#fff' : '#000', borderTopColor: 'transparent' }}></span> Injecting...</>) : (<><PlayCircle className="w-3.5 h-3.5" /> Inject Now</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
