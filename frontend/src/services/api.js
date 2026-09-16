let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE = `${rawBaseUrl}/api/v1`;

export const api = {
  // Metrics & KPIs
  getDashboardMetrics: async () => {
    const res = await fetch(`${API_BASE}/metrics/summary`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // Alerts
  getAlerts: async (status, severity) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    const res = await fetch(`${API_BASE}/alerts/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  getAlertDetail: async (alertId) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`);
    if (!res.ok) throw new Error('Failed to fetch alert detail');
    return res.json();
  },

  updateAlertStatus: async (alertId, status) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Multi-Agent Investigation
  runInvestigation: async (alertId) => {
    const res = await fetch(`${API_BASE}/investigation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId })
    });
    if (!res.ok) throw new Error('Investigation execution failed');
    return res.json();
  },

  getInvestigationHistory: async () => {
    const res = await fetch(`${API_BASE}/investigation/history`);
    return res.json();
  },

  sendCopilotChat: async (message, context) => {
    const res = await fetch(`${API_BASE}/investigation/copilot-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    return res.json();
  },

  // Network Graph
  getNetworkGraph: async (accountNumber) => {
    const url = accountNumber 
      ? `${API_BASE}/graph/?account_number=${accountNumber}` 
      : `${API_BASE}/graph/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch network graph');
    return res.json();
  },

  // Transactions & Scenario Simulator
  getTransactions: async (accountNumber, onlySuspicious = false) => {
    const params = new URLSearchParams();
    if (accountNumber) params.append('account_number', accountNumber);
    if (onlySuspicious) params.append('only_suspicious', 'true');
    const res = await fetch(`${API_BASE}/transactions/?${params.toString()}`);
    return res.json();
  },

  injectScenario: async (scenarioType, customData = null) => {
    const payload = customData ? { ...customData, scenario_type: scenarioType } : { scenario_type: scenarioType };
    const res = await fetch(`${API_BASE}/transactions/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Scenario injection failed');
    return res.json();
  },

  uploadTransactionsFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/transactions/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'File upload failed');
    }
    return res.json();
  },

  // SAR Reports
  getSARs: async () => {
    const res = await fetch(`${API_BASE}/sar/`);
    return res.json();
  },

  getSARDetail: async (reportId) => {
    const res = await fetch(`${API_BASE}/sar/${reportId}`);
    return res.json();
  },

  updateSARStatus: async (reportId, status) => {
    const res = await fetch(`${API_BASE}/sar/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
