import React from 'react';
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
  Sun,
  Moon
} from 'lucide-react';

export default function Layout({ activeTab, setActiveTab, onOpenSimulator, activeCaseId, theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
      {/* Left Sidebar */}
      <aside 
        className="w-64 border-r flex flex-col justify-between shrink-0 transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-main)' }}
      >
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-main)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                style={{ 
                  backgroundColor: isLight ? '#000000' : '#ffffff', 
                  color: isLight ? '#ffffff' : '#000000',
                  borderColor: 'var(--border-main)'
                }}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                  FinGuard <span className="font-mono text-xs px-1.5 py-0.5 rounded border font-semibold"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)' 
                    }}
                  >AI</span>
                </div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>AML Forensic Intelligence</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Investigation Core
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border shadow-sm font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: activeTab === 'dashboard' ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                color: activeTab === 'dashboard' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-secondary)',
                borderColor: activeTab === 'dashboard' ? 'transparent' : 'transparent'
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('workbench')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'workbench'
                  ? 'border shadow-sm font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: activeTab === 'workbench' ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                color: activeTab === 'workbench' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-secondary)',
                borderColor: activeTab === 'workbench' ? 'transparent' : 'transparent'
              }}
            >
              <Microscope className="w-4 h-4" />
              <div className="flex-1 flex items-center justify-between">
                <span>Case Workbench</span>
                {activeCaseId && (
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: isLight ? '#000000' : '#ffffff' }}></span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'graph'
                  ? 'border shadow-sm font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: activeTab === 'graph' ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                color: activeTab === 'graph' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-secondary)',
                borderColor: activeTab === 'graph' ? 'transparent' : 'transparent'
              }}
            >
              <Share2 className="w-4 h-4" />
              <span>Entity Network Graph</span>
            </button>

            <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Compliance & Reporting
            </div>

            <button
              onClick={() => setActiveTab('sar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sar'
                  ? 'border shadow-sm font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: activeTab === 'sar' ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                color: activeTab === 'sar' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-secondary)',
                borderColor: activeTab === 'sar' ? 'transparent' : 'transparent'
              }}
            >
              <FileText className="w-4 h-4" />
              <span>SAR Narrative Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('typologies')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'typologies'
                  ? 'border shadow-sm font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: activeTab === 'typologies' ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                color: activeTab === 'typologies' ? (isLight ? '#ffffff' : '#000000') : 'var(--text-secondary)',
                borderColor: activeTab === 'typologies' ? 'transparent' : 'transparent'
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>FATF / FinCEN RAG</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-main)' }}>
          {/* Quick Theme Switcher in Sidebar */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition shadow-sm"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-main)'
            }}
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isLight ? 'White Theme (Active)' : 'Black Theme (Active)'}</span>
            </span>
            <span className="text-[10px] font-mono uppercase opacity-75 font-bold">Switch</span>
          </button>

          {/* Simulate threat button */}
          <button
            onClick={onOpenSimulator}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg border shadow-sm transition-all cursor-pointer"
            style={{
              backgroundColor: isLight ? '#000000' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              borderColor: 'var(--border-main)'
            }}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Inject AML Topology</span>
          </button>

          <div className="flex items-center justify-between text-[11px] px-1 font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isLight ? '#000000' : '#ffffff' }}></span>
              7 Agents Ready
            </span>
            <span>v1.0-B&W</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header 
          className="h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors duration-200"
          style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              {activeTab === 'dashboard' && 'AML Alert Triage & Risk Intelligence'}
              {activeTab === 'workbench' && 'Multi-Agent Forensic Investigation Workbench'}
              {activeTab === 'graph' && 'Interactive Entity & Money-Flow Topology'}
              {activeTab === 'sar' && 'Regulatory SAR Filing & Narrative Studio'}
              {activeTab === 'typologies' && 'FATF / FinCEN Regulatory Typology Vector Library'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Prominent Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
              title="Toggle Black & White Theme"
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Switch to Black Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Switch to White Theme</span>
                </>
              )}
            </button>

            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Monitor: <strong className="underline">Active</strong></span>
            </div>
            
            <button 
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer shadow-sm"
              style={{
                backgroundColor: isLight ? '#000000' : '#ffffff',
                color: isLight ? '#ffffff' : '#000000',
                borderColor: 'var(--border-main)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Threat</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body rendered by App.jsx */}
      </div>
    </div>
  );
}
