import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from 'lucide-react';

export default function TransactionTable({ transactions = [], targetAccount, theme }) {
  const [filterSuspicious, setFilterSuspicious] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isLight = theme === 'light';

  const filtered = transactions.filter(tx => {
    if (filterSuspicious && !tx.is_suspicious && (tx.anomaly_score || 0) < 60) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (tx.source_account?.toLowerCase().includes(term) || tx.destination_account?.toLowerCase().includes(term) || tx.description?.toLowerCase().includes(term) || tx.transaction_id?.toLowerCase().includes(term));
    }
    return true;
  });

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Forensic Transaction Ledger</h3>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Showing {filtered.length} of {transactions.length} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border rounded-lg text-xs font-mono focus:outline-none w-44"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
          </div>
          <button onClick={() => setFilterSuspicious(!filterSuspicious)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer"
            style={{
              backgroundColor: filterSuspicious ? (isLight ? '#000' : '#fff') : 'var(--bg-card)',
              color: filterSuspicious ? (isLight ? '#fff' : '#000') : 'var(--text-main)',
              borderColor: 'var(--border-main)'
            }}>
            <Filter className="w-3 h-3" /><span>Anomalies Only</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-[11px] uppercase font-mono font-bold" style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}>
              <th className="pb-2.5">Tx ID</th>
              <th className="pb-2.5">Flow Path</th>
              <th className="pb-2.5">Channel</th>
              <th className="pb-2.5">Amount</th>
              <th className="pb-2.5">ML Anomaly</th>
              <th className="pb-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-main)' }}>
            {filtered.map((tx) => {
              const isOutflow = tx.source_account === targetAccount;
              const anomalyScore = tx.anomaly_score || 0;
              const isHighAnomaly = anomalyScore >= 70 || tx.is_suspicious;
              return (
                <tr key={tx.transaction_id} className="transition"
                  style={{ backgroundColor: isHighAnomaly ? (isLight ? '#fef2f2' : '#1c1111') : 'transparent' }}>
                  <td className="py-2.5 font-bold" style={{ color: 'var(--text-main)' }}>{tx.transaction_id}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {isOutflow ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate max-w-[90px]">{tx.source_account}</span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span className="truncate max-w-[90px]">{tx.destination_account}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                      {tx.channel}
                    </span>
                  </td>
                  <td className="py-2.5 font-black" style={{ color: 'var(--text-main)' }}>
                    {isOutflow ? '-' : '+'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        backgroundColor: anomalyScore >= 75 ? (isLight ? '#000' : '#fff') : 'var(--bg-subtle)',
                        color: anomalyScore >= 75 ? (isLight ? '#fff' : '#000') : 'var(--text-main)',
                        borderColor: 'var(--border-main)'
                      }}>
                      {anomalyScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 max-w-[200px] truncate text-[11px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
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
