import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../services/api';
import SARNarrativeViewer from '../components/SARNarrativeViewer';

export default function SARArchive({ theme }) {
  const [sars, setSars] = useState([]);
  const [selectedSar, setSelectedSar] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLight = theme === 'light';

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
      <div className="glass-panel p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
        <h2 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <FileText className="w-5 h-5" />
          <span>Suspicious Activity Report (SAR) Regulatory Archive</span>
        </h2>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Official statutory filings synthesized by FinGuard Multi-Agent Intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left SAR List */}
        <div className="glass-panel p-4 space-y-3 lg:col-span-1 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
          <div className="text-xs font-bold border-b pb-2" style={{ color: 'var(--text-main)', borderColor: 'var(--border-main)' }}>
            Generated Reports ({sars.length})
          </div>

          <div className="space-y-2">
            {sars.map((s) => {
              const isSelected = selectedSar?.report_id === s.report_id;
              return (
                <div
                  key={s.report_id}
                  onClick={() => handleSelectSar(s.report_id)}
                  className="p-3 rounded-lg border cursor-pointer transition"
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                    borderColor: isSelected ? 'var(--text-main)' : 'var(--border-main)'
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>{s.report_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        backgroundColor: s.status === 'FILED' ? (isLight ? '#000000' : '#ffffff') : 'var(--bg-subtle)',
                        color: s.status === 'FILED' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-main)',
                        borderColor: 'var(--border-main)'
                      }}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1" style={{ color: 'var(--text-main)' }}>{s.customer_name}</div>
                  <div className="text-[11px] font-mono mt-0.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{s.case_id}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right SAR Preview Studio */}
        <div className="lg:col-span-2">
          <SARNarrativeViewer 
            sarDraft={selectedSar} 
            theme={theme}
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
