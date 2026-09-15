import React, { useState } from 'react';
import { PlayCircle, X, ShieldAlert, Zap, Repeat, Users, Globe, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const SCENARIOS = [
  {
    id: "SMURFING_INJECTION",
    title: "Structuring & Smurfing Ring",
    subtitle: "Below $10,000 threshold cash bursts",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    description: "Generates 6 rapid branch cash deposits between $9,150 and $9,800 to evade CTR reporting limits, followed by consolidated outward wire transfer."
  },
  {
    id: "CIRCULAR_INJECTION",
    title: "Circular Round-Trip Pass-Through",
    subtitle: "4-Hop offshore shell routing",
    icon: Repeat,
    color: "from-purple-500 to-indigo-600",
    description: "Injects multi-jurisdiction loop (Cayman -> Panama -> Cyprus -> Dubai -> Cayman) laundering $450,000 with 95% principal returned."
  }
];

export default function LiveSimulatorModal({ isOpen, onClose, onInjected }) {
  const [selectedScenario, setSelectedScenario] = useState('SMURFING_INJECTION');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleInject = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.injectScenario(selectedScenario);
      setResult(res);
      if (onInjected) onInjected(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0e131f] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live AML Threat Simulator</h3>
              <p className="text-xs text-slate-400">Inject complex money laundering topologies in real-time</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scenario Select Cards */}
        <div className="space-y-2.5">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10' 
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${sc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{sc.title}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono">{sc.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{sc.description}</p>
              </div>
            );
          })}
        </div>

        {/* Status result */}
        {result && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully generated Alert #{result.alert_id}!</span>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleInject}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Injecting Topology...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Inject Scenario Now
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
