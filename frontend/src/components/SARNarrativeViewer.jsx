import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Printer, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

export default function SARNarrativeViewer({ sarDraft, onStatusUpdate }) {
  const [copied, setCopied] = useState(false);
  const [isFiling, setIsFiling] = useState(false);

  if (!sarDraft || !sarDraft.narrative) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400 space-y-2">
        <FileText className="w-10 h-10 mx-auto text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-300">No SAR Draft Generated Yet</h4>
        <p className="text-xs text-slate-400">Run the multi-agent investigation to synthesize the formal Suspicious Activity Report narrative.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(sarDraft.narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([sarDraft.narrative], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${sarDraft.report_id || 'SAR_Report'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileSAR = async () => {
    setIsFiling(true);
    try {
      if (sarDraft.report_id) {
        await api.updateSARStatus(sarDraft.report_id, 'FILED');
        if (onStatusUpdate) onStatusUpdate('FILED');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFiling(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Suspicious Activity Report (SAR) Studio</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                {sarDraft.report_id}
              </span>
            </div>
            <p className="text-xs text-slate-400">FinCEN Form 111 Compliant Multi-Agent Forensic Synthesis</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleFileSAR}
            disabled={isFiling || sarDraft.status === 'FILED'}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 disabled:opacity-60 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{sarDraft.status === 'FILED' ? 'Formally Filed with FinCEN' : 'Approve & Submit SAR'}</span>
          </button>
        </div>
      </div>

      {/* Recommended Actions Pills */}
      {sarDraft.recommended_actions && sarDraft.recommended_actions.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Mandatory Statutory Actions
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sarDraft.recommended_actions.map((act, i) => (
              <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs flex items-start gap-2">
                <span className="text-cyan-400 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 mt-0.5">
                  {act.action}
                </span>
                <span className="text-slate-300 text-[11px]">{act.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markdown Narrative Document Preview */}
      <div className="p-6 bg-[#090d16] border border-slate-800 rounded-xl overflow-y-auto max-h-[500px] text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
        {sarDraft.narrative}
      </div>
    </div>
  );
}
