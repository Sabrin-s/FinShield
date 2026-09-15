import React, { useState, useEffect } from 'react';
import { Share2, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import NetworkGraph from '../components/NetworkGraph';

export default function NetworkExplorer() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], metrics: {} });
  const [accountQuery, setAccountQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>Global Entity & Fund-Flow Network Explorer</span>
          </h2>
          <p className="text-xs text-slate-400">
            Trace multi-hop transactions, circular money loops, and money mule hubs across all entities
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter by account # (e.g. ACC-US-991024)"
            value={accountQuery}
            onChange={(e) => setAccountQuery(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono w-72"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Filter Graph</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-cyan-400 font-mono text-sm animate-pulse">
          Computing graph centralities and cycle matrices...
        </div>
      ) : (
        <NetworkGraph 
          graphData={graphData}
          targetAccount={accountQuery}
        />
      )}
    </div>
  );
}
