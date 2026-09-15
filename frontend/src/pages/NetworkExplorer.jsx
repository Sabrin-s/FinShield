import React, { useState, useEffect } from 'react';
import { Share2, Search } from 'lucide-react';
import { api } from '../services/api';
import NetworkGraph from '../components/NetworkGraph';

export default function NetworkExplorer({ theme }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], metrics: {} });
  const [accountQuery, setAccountQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const isLight = theme === 'light';

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async (acc) => {
    setLoading(true);
    try {
      const data = await api.getNetworkGraph(acc || undefined);
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGraph(accountQuery.trim());
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
        <div>
          <h2 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Share2 className="w-5 h-5" />
            <span>Global Entity & Fund-Flow Network Explorer</span>
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Trace multi-hop transactions, circular money loops, and money mule hubs across all entities
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter by account # (e.g. ACC-US-991024)"
            value={accountQuery}
            onChange={(e) => setAccountQuery(e.target.value)}
            className="px-3.5 py-2 border rounded-lg text-xs font-mono w-72 focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-main)'
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border"
            style={{
              backgroundColor: isLight ? '#000000' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              borderColor: 'var(--border-main)'
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Filter Graph</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 font-mono text-sm font-bold animate-pulse" style={{ color: 'var(--text-main)' }}>
          Computing graph centralities and cycle matrices...
        </div>
      ) : (
        <NetworkGraph 
          graphData={graphData}
          targetAccount={accountQuery}
          theme={theme}
        />
      )}
    </div>
  );
}
