import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseWorkbench from './pages/CaseWorkbench';
import NetworkExplorer from './pages/NetworkExplorer';
import SARArchive from './pages/SARArchive';
import TypologyLibrary from './pages/TypologyLibrary';
import LiveSimulatorModal from './components/LiveSimulatorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAlertId, setActiveAlertId] = useState('ALT-2026-8801');
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  
  // Theme state: default to 'light' (white theme with ultra-clear letters) or 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finguard_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('finguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectAlert = (alertId) => {
    setActiveAlertId(alertId);
    setActiveTab('workbench');
  };

  const handleScenarioInjected = (result) => {
    setSimulatorOpen(false);
    if (result.alert_id) {
      setActiveAlertId(result.alert_id);
      setActiveTab('workbench');
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setSimulatorOpen(true)}
        activeCaseId={activeAlertId}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Page Area */}
      <div className="fixed inset-0 left-64 top-16 overflow-y-auto p-6 bg-grid-pattern transition-colors duration-200" style={{ backgroundColor: 'var(--bg-page)' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            onSelectAlert={handleSelectAlert} 
            onOpenSimulator={() => setSimulatorOpen(true)} 
            theme={theme}
          />
        )}

        {activeTab === 'workbench' && (
          <CaseWorkbench 
            alertId={activeAlertId} 
            onBack={() => setActiveTab('dashboard')} 
            theme={theme}
          />
        )}

        {activeTab === 'graph' && (
          <NetworkExplorer theme={theme} />
        )}

        {activeTab === 'sar' && (
          <SARArchive theme={theme} />
        )}

        {activeTab === 'typologies' && (
          <TypologyLibrary theme={theme} />
        )}
      </div>

      {/* Live Threat Simulator Modal */}
      <LiveSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onInjected={handleScenarioInjected}
        theme={theme}
      />
    </>
  );
}
