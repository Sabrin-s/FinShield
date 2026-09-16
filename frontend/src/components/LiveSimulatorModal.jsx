import React, { useState, useRef } from 'react';
import { 
  PlayCircle, 
  X, 
  Zap, 
  Repeat, 
  Users, 
  ShieldAlert, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileUp, 
  Code2,
  Download,
  ArrowRight,
  Eye
} from 'lucide-react';
import { api } from '../services/api';

const SCENARIOS = [
  {
    id: "SMURFING_INJECTION",
    title: "Structuring & Smurfing Ring",
    subtitle: "Below $10,000 threshold cash bursts",
    icon: Zap,
    severity: "HIGH",
    description: "Generates 6 rapid branch cash deposits between $9,150 and $9,800 to evade CTR reporting limits."
  },
  {
    id: "CIRCULAR_INJECTION",
    title: "Circular Round-Trip Pass-Through",
    subtitle: "4-Hop offshore shell routing",
    icon: Repeat,
    severity: "CRITICAL",
    description: "Injects multi-jurisdiction loop laundering $450,000 through Cayman, Panama, Cyprus, and Dubai."
  },
  {
    id: "MULE_RING_INJECTION",
    title: "Money Mule Dispersal Ring",
    subtitle: "Rapid 1-to-5 mule fan-out",
    icon: Users,
    severity: "HIGH",
    description: "Inbound $180,000 wire rapidly dispersed into 5 individual mule accounts ($35,000 each) within 4 hours."
  },
  {
    id: "SANCTION_INJECTION",
    title: "OFAC Sanctions & PEP Wire",
    subtitle: "Prohibited foreign entity match",
    icon: ShieldAlert,
    severity: "CRITICAL",
    description: "Attempted $320,000 wire transaction with counterparty matching prohibited OFAC SDGT designated entity."
  }
];

const SAMPLE_JSON_TEMPLATE = JSON.stringify({
  "customer_name": "Apex Global Imports LLC",
  "entity_type": "LLC",
  "country": "US",
  "alert_type": "STRUCTURING",
  "severity": "HIGH",
  "title": "Suspected Structured Wire Layering",
  "summary": "Multiple sub-threshold wire dispersals across commercial accounts.",
  "amount": 95000.0,
  "transactions": [
    {
      "source_account": "ACC-EXTERNAL-101",
      "amount": 9250.0,
      "channel": "CASH_DEPOSIT",
      "description": "Branch Deposit Station 1"
    },
    {
      "source_account": "ACC-EXTERNAL-102",
      "amount": 9750.0,
      "channel": "CASH_DEPOSIT",
      "description": "Branch Deposit Station 2"
    },
    {
      "source_account": "ACC-EXTERNAL-103",
      "amount": 45000.0,
      "channel": "WIRE",
      "description": "Outward Commercial Settlement"
    }
  ]
}, null, 2);

const SAMPLE_CSV_CONTENT = `source_account,destination_account,amount,channel,description,country_source
ACC-PAYROLL-EXT-01,ACC-DEST-99201,18500.0,WIRE,Executive Advance Payout,US
ACC-PAYROLL-EXT-02,ACC-DEST-99201,24000.0,WIRE,Consultancy Retainer,GB
ACC-PAYROLL-EXT-03,ACC-DEST-99201,9500.0,CASH_DEPOSIT,Branch Deposit Queens,US
ACC-PAYROLL-EXT-04,ACC-DEST-99201,9800.0,CASH_DEPOSIT,Branch Deposit Midtown,US
ACC-DEST-99201,ACC-OFFSHORE-999,48000.0,WIRE,Urgent Offshore Settlement,PA`;

export default function LiveSimulatorModal({ isOpen, onClose, onInjected, theme }) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'json'
  const [selectedScenario, setSelectedScenario] = useState('SMURFING_INJECTION');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // File upload & preview state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const fileInputRef = useRef(null);

  // Custom JSON state
  const [customJsonText, setCustomJsonText] = useState(SAMPLE_JSON_TEMPLATE);

  const isLight = theme === 'light';

  if (!isOpen) return null;

  const parseFileForPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result;
        if (!content || typeof content !== 'string') return;

        if (file.name.toLowerCase().endsWith('.json')) {
          const data = JSON.parse(content);
          const txs = Array.isArray(data) ? data : (data.transactions || [data]);
          setFilePreview(txs.slice(0, 5));
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const rows = lines.slice(1, 6).map(line => {
              const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
              const obj = {};
              headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
              return obj;
            });
            setFilePreview(rows);
          }
        }
      } catch (e) {
        console.error("Preview parse error", e);
        setFilePreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setResult(null);
      parseFileForPreview(file);
    }
  };

  const loadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const sampleFile = new File([blob], 'aml_sample_transactions.csv', { type: 'text/csv' });
    setSelectedFile(sampleFile);
    setError(null);
    setResult(null);
    parseFileForPreview(sampleFile);
  };

  const handleInjectPreset = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.injectScenario(selectedScenario);
      setResult(res);
      if (onInjected) onInjected(res);
    } catch (err) {
      setError(err.message || 'Scenario injection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a .json or .csv file first.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.uploadTransactionsFile(selectedFile);
      setResult(res);
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomJsonInject = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const parsed = JSON.parse(customJsonText);
      const res = await api.injectScenario('CUSTOM_INJECTION', parsed);
      setResult(res);
    } catch (err) {
      setError(`Invalid JSON or Injection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCase = (res) => {
    if (onInjected) onInjected(res);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div
        className="max-w-xl w-full p-6 shadow-2xl rounded-2xl border flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: isLight ? '#ffffff' : '#0c0d12',
          borderColor: isLight ? '#cbd5e1' : '#27272a'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: isLight ? '#f1f5f9' : '#18181b',
                color: isLight ? '#0f172a' : '#ffffff',
                borderColor: isLight ? '#cbd5e1' : '#3f3f46'
              }}
            >
              <PlayCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                Live AML Threat Simulator
              </h3>
              <p className="text-xs font-semibold" style={{ color: isLight ? '#475569' : '#a1a1aa' }}>
                Inject realistic money laundering topologies or upload custom transaction files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg cursor-pointer transition hover:opacity-80"
            style={{ color: isLight ? '#64748b' : '#a1a1aa' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 border-b pb-3" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
          <button
            onClick={() => { setActiveTab('presets'); setError(null); setResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Preset Topologies (4)</span>
          </button>

          <button
            onClick={() => { setActiveTab('upload'); setError(null); setResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload File (.json / .csv)</span>
          </button>

          <button
            onClick={() => { setActiveTab('json'); setError(null); setResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeTab === 'json'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Custom JSON</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* TAB 1: PRESET TOPOLOGIES */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              {SCENARIOS.map((sc) => {
                const Icon = sc.icon;
                const isSelected = selectedScenario === sc.id;

                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-1 ring-blue-600'
                          : 'bg-zinc-900 border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : isLight
                          ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isLight
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className="text-xs font-bold leading-tight"
                              style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                            >
                              {sc.title}
                            </h4>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                sc.severity === 'CRITICAL'
                                  ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              }`}
                            >
                              {sc.severity}
                            </span>
                          </div>
                          <p
                            className="text-[11px] font-mono font-semibold mt-0.5"
                            style={{ color: isSelected ? (isLight ? '#2563eb' : '#60a5fa') : (isLight ? '#64748b' : '#94a3b8') }}
                          >
                            {sc.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : isLight
                                ? 'border-slate-300 bg-white'
                                : 'border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    </div>

                    <p
                      className="text-xs mt-2 leading-relaxed font-normal"
                      style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                    >
                      {sc.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                  Select File:
                </span>
                <button
                  type="button"
                  onClick={loadSampleCSV}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Load Sample AML CSV File</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : isLight
                      ? 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                      : 'border-zinc-800 hover:border-blue-500 bg-zinc-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  selectedFile ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                }`}>
                  {selectedFile ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <h4 className="text-xs font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop a file'}
                </h4>
                <p className="text-[11px] mt-1 font-semibold" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                  Supported formats: <strong className="text-blue-600">.JSON</strong> or <strong className="text-blue-600">.CSV</strong> (financial transactions)
                </p>
                {selectedFile && (
                  <p className="text-[10px] font-mono mt-1 text-emerald-600 font-bold">
                    File selected: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              {/* Live File Content Preview Table */}
              {filePreview.length > 0 && (
                <div
                  className="p-3 rounded-xl border text-xs overflow-hidden"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#18181b',
                    borderColor: isLight ? '#e2e8f0' : '#27272a'
                  }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b font-bold" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
                    <div className="flex items-center gap-1.5" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Parsed File Preview ({filePreview.length} records):</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Validated Format
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-36">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead>
                        <tr className="border-b" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a', color: isLight ? '#64748b' : '#94a3b8' }}>
                          <th className="pb-1">From</th>
                          <th className="pb-1">To</th>
                          <th className="pb-1">Amount</th>
                          <th className="pb-1">Channel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: isLight ? '#f1f5f9' : '#27272a' }}>
                        {filePreview.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-1 pr-2 truncate max-w-[120px] font-medium" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                              {row.source_account || row.from || 'ACC-SRC'}
                            </td>
                            <td className="py-1 pr-2 truncate max-w-[120px]" style={{ color: isLight ? '#475569' : '#a1a1aa' }}>
                              {row.destination_account || row.to || 'ACC-DEST'}
                            </td>
                            <td className="py-1 font-bold text-emerald-600">
                              ${Number(row.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-1 text-[10px]" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                              {row.channel || 'WIRE'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM JSON */}
          {activeTab === 'json' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                  Paste Custom Case Payload:
                </span>
                <button
                  type="button"
                  onClick={() => setCustomJsonText(SAMPLE_JSON_TEMPLATE)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset Template
                </button>
              </div>
              <textarea
                value={customJsonText}
                onChange={(e) => setCustomJsonText(e.target.value)}
                rows={10}
                className="w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor: isLight ? '#f8fafc' : '#18181b',
                  borderColor: isLight ? '#cbd5e1' : '#27272a',
                  color: isLight ? '#0f172a' : '#f4f4f5'
                }}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-red-500/10 border-red-500/20 text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Result Card */}
          {result && (
            <div className="p-4 rounded-xl border space-y-2.5 bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{result.message || 'Case Generated Successfully!'}</span>
              </div>
              <div className="text-xs space-y-1 font-mono" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                <div>Alert Generated: <strong className="text-emerald-600">#{result.alert_id}</strong></div>
                <div>Target Account: <strong>{result.account_number}</strong></div>
                {result.transactions_count && (
                  <div>Ingested Transactions: <strong>{result.transactions_count} records</strong></div>
                )}
              </div>
              <button
                onClick={() => handleGoToCase(result)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <span>Open Case Workbench & View Forensic Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
          <p className="text-[11px] font-medium" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
            {activeTab === 'presets' ? 'Direct AML pipeline injection' : 'Generates real-time forensic case'}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition hover:opacity-80"
              style={{
                backgroundColor: isLight ? '#ffffff' : '#18181b',
                borderColor: isLight ? '#cbd5e1' : '#27272a',
                color: isLight ? '#0f172a' : '#ffffff'
              }}
            >
              Close
            </button>

            {activeTab === 'presets' && !result && (
              <button
                onClick={handleInjectPreset}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Injecting...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Inject Selected Threat</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'upload' && !result && (
              <button
                onClick={handleFileUpload}
                disabled={loading || !selectedFile}
                className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Process File</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'json' && !result && (
              <button
                onClick={handleCustomJsonInject}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4" />
                    <span>Inject Custom JSON</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
