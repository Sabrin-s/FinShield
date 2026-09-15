import React, { useState } from 'react';
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
      />

      {/* Main Page Area Mounted through dynamic render */}
      <div className="fixed inset-0 left-64 top-16 overflow-y-auto p-6 bg-[#07090e] bg-grid-pattern">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onSelectAlert={handleSelectAlert} 
            onOpenSimulator={() => setSimulatorOpen(true)} 
          />
        )}

        {activeTab === 'workbench' && (
          <CaseWorkbench 
            alertId={activeAlertId} 
            onBack={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'graph' && (
          <NetworkExplorer />
        )}

        {activeTab === 'sar' && (
          <SARArchive />
        )}

        {activeTab === 'typologies' && (
          <TypologyLibrary />
        )}
      </div>

      {/* Live Threat Simulator Modal */}
      <LiveSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onInjected={handleScenarioInjected}
      />
    </>
  );
}
