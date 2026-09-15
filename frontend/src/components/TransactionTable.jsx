import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

export default function TransactionTable({ transactions = [], targetAccount }) {
  const [filterSuspicious, setFilterSuspicious] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(tx => {
    if (filterSuspicious && !tx.is_suspicious && (tx.anomaly_score || 0) < 60) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSrc = tx.source_account?.toLowerCase().includes(term);
      const matchDest = tx.destination_account?.toLowerCase().includes(term);
      const matchDesc = tx.description?.toLowerCase().includes(term);
      const matchId = tx.transaction_id?.toLowerCase().includes(term);
      if (!matchSrc && !matchDest && !matchDesc && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Forensic Transaction Ledger</h3>
          <p className="text-xs text-slate-400">Showing {filtered.length} of {transactions.length} transactions</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search account, desc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-44 font-mono"
            />
          </div>

          <button
            onClick={() => setFilterSuspicious(!filterSuspicious)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              filterSuspicious 
                ? 'bg-rose-950/80 border border-rose-800 text-rose-300' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
              <th className="pb-2.5 font-semibold">Tx ID</th>
              <th className="pb-2.5 font-semibold">Flow Path</th>
              <th className="pb-2.5 font-semibold">Channel</th>
              <th className="pb-2.5 font-semibold">Amount</th>
              <th className="pb-2.5 font-semibold">ML Anomaly</th>
              <th className="pb-2.5 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((tx) => {
              const isOutflow = tx.source_account === targetAccount;
              const anomalyScore = tx.anomaly_score || 0;
              const isHighAnomaly = anomalyScore >= 70 || tx.is_suspicious;

              return (
                <tr key={tx.transaction_id} className={`hover:bg-slate-900/40 transition ${isHighAnomaly ? 'bg-rose-950/15' : ''}`}>
                  <td className="py-2.5 text-slate-300 font-semibold">{tx.transaction_id}</td>
                  
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {isOutflow ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[90px]">{tx.source_account}</span>
                      <span className="text-slate-400">→</span>
                      <span className="truncate max-w-[90px]">{tx.destination_account}</span>
                    </div>
                  </td>

                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                      {tx.channel}
                    </span>
                  </td>

                  <td className="py-2.5 font-bold">
                    <span className={isOutflow ? 'text-rose-400' : 'text-emerald-400'}>
                      {isOutflow ? '-' : '+'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anomalyScore >= 75 
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800' 
                        : anomalyScore >= 50
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {anomalyScore}/100
                    </span>
                  </td>

                  <td className="py-2.5 text-slate-400 max-w-[200px] truncate text-[11px] font-sans">
                    {tx.description || 'Standard Transfer'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
