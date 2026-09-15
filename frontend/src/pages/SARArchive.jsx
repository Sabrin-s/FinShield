import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, Search, Eye } from 'lucide-react';
import { api } from '../services/api';
import SARNarrativeViewer from '../components/SARNarrativeViewer';

export default function SARArchive() {
  const [sars, setSars] = useState([]);
  const [selectedSar, setSelectedSar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSARs();
  }, []);

  const loadSARs = async () => {
    setLoading(true);
    try {
      const list = await api.getSARs();
      setSars(list);
      if (list.length > 0) {
        const detail = await api.getSARDetail(list[0].report_id);
        setSelectedSar(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSar = async (reportId) => {
    try {
      const detail = await api.getSARDetail(reportId);
      setSelectedSar(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>Suspicious Activity Report (SAR) Regulatory Archive</span>
        </h2>
        <p className="text-xs text-slate-400">
          Official statutory filings synthesized by FinGuard Multi-Agent Intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left SAR List */}
        <div className="glass-panel p-4 space-y-3 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
            Generated Reports ({sars.length})
          </div>

          <div className="space-y-2">
            {sars.map((s) => (
              <div
                key={s.report_id}
                onClick={() => handleSelectSar(s.report_id)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedSar?.report_id === s.report_id
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-300">{s.report_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    s.status === 'FILED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-1">{s.customer_name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.case_id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right SAR Preview Studio */}
        <div className="lg:col-span-2">
          <SARNarrativeViewer 
            sarDraft={selectedSar} 
            onStatusUpdate={(newStatus) => {
              setSelectedSar(prev => prev ? { ...prev, status: newStatus } : null);
              loadSARs();
            }}
          />
        </div>
      </div>
    </div>
  );
}
