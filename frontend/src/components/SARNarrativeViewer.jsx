import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

export default function SARNarrativeViewer({ sarDraft, onStatusUpdate, onRunInvestigation, isRunning, theme }) {
  const [copied, setCopied] = useState(false);
  const [isFiling, setIsFiling] = useState(false);
  const isLight = theme === 'light';

  if (!sarDraft || !sarDraft.narrative) {
    return (
      <div className="glass-panel p-8 text-center space-y-4 max-w-lg mx-auto my-6 border"
        style={{ borderColor: 'var(--border-main)', backgroundColor: 'var(--bg-card)' }}>
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>No SAR Draft Generated Yet</h4>
          <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            The formal FinCEN Form 111 Suspicious Activity Report narrative is drafted automatically when the 7-Agent Swarm analyzes this case.
          </p>
        </div>
        {onRunInvestigation && (
          <button
            onClick={onRunInvestigation}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm disabled:opacity-60 transition"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Swarm Synthesizing SAR...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Execute 7-Agent Swarm to Generate SAR</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  const handleCopy = () => { navigator.clipboard.writeText(sarDraft.narrative); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([sarDraft.narrative], { type: 'text/markdown' }));
    el.download = `${sarDraft.report_id || 'SAR_Report'}.md`;
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
  };
  const handleFileSAR = async () => {
    setIsFiling(true);
    try { if (sarDraft.report_id) { await api.updateSARStatus(sarDraft.report_id, 'FILED'); if (onStatusUpdate) onStatusUpdate('FILED'); } } catch (e) { console.error(e); } finally { setIsFiling(false); }
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border-main)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>SAR Narrative Studio</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                {sarDraft.report_id}
              </span>
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>FinCEN Form 111 Compliant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            <Download className="w-3.5 h-3.5" /><span>Export</span>
          </button>
          <button onClick={handleFileSAR} disabled={isFiling || sarDraft.status === 'FILED'}
            className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border disabled:opacity-60"
            style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{sarDraft.status === 'FILED' ? 'Filed with FinCEN' : 'Approve & Submit SAR'}</span>
          </button>
        </div>
      </div>

      {sarDraft.recommended_actions?.length > 0 && (
        <div className="p-3.5 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)' }}>
          <span className="text-[11px] uppercase font-mono font-bold" style={{ color: 'var(--text-main)' }}>Mandatory Statutory Actions</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sarDraft.recommended_actions.map((act, i) => (
              <div key={i} className="p-2.5 rounded border text-xs flex items-start gap-2"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5"
                  style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
                  {act.action}
                </span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{act.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 border rounded-xl overflow-y-auto max-h-[500px] text-xs font-mono leading-relaxed whitespace-pre-wrap"
        style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
        {sarDraft.narrative}
      </div>
    </div>
  );
}
