import React, { useState } from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Microscope, 
  Share2, 
  FileText, 
  BookOpen, 
  Sparkles, 
  PlayCircle,
  Activity,
  Search,
  Bell
} from 'lucide-react';

export default function Layout({ activeTab, setActiveTab, onOpenSimulator, activeCaseId }) {
  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                FinGuard <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AML Multi-Agent Copilot</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Investigation Core
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('workbench')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'workbench'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Microscope className="w-4 h-4" />
              <div className="flex-1 flex items-center justify-between">
                <span>Case Workbench</span>
                {activeCaseId && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'graph'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Entity Network Graph</span>
            </button>

            <div className="pt-4 px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Compliance & Reporting
            </div>

            <button
              onClick={() => setActiveTab('sar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sar'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>SAR Narrative Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('typologies')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'typologies'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>FATF / FinCEN RAG</span>
            </button>
          </nav>
        </div>

        {/* Live Simulator Trigger Button in Sidebar */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={onOpenSimulator}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Inject AML Topology</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              7 Agents Online
            </span>
            <span>v1.0-PROD</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0e17]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-slate-200">
              {activeTab === 'dashboard' && 'AML Alert Triage & Risk Intelligence'}
              {activeTab === 'workbench' && 'Multi-Agent Forensic Investigation Workbench'}
              {activeTab === 'graph' && 'Interactive Entity & Money-Flow Topology'}
              {activeTab === 'sar' && 'Regulatory SAR Filing & Narrative Studio'}
              {activeTab === 'typologies' && 'FATF / FinCEN Regulatory Typology Vector Library'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Real-Time Monitor: <strong className="text-white">Active</strong></span>
            </div>
            
            <button 
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Threat</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#07090e] bg-grid-pattern">
          {/* Active component rendered via prop */}
        </main>
      </div>
    </div>
  );
}
