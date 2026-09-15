import React, { useState } from 'react';
import { 
  Bot, CheckCircle2, Clock, Cpu, ChevronDown, ChevronRight, FileText, 
  Layers, Search, ShieldCheck, AlertTriangle, Network, Zap
} from 'lucide-react';

const AGENT_META = {
  "Planner Agent": { icon: Layers, badge: "Hypothesis & Scope" },
  "Transaction Agent": { icon: Zap, badge: "Ledger ML & Velocity" },
  "KYC & Entity Agent": { icon: Search, badge: "PEP & Corporate CDD" },
  "Sanction & Document Agent": { icon: ShieldCheck, badge: "OFAC SDN Matching" },
  "Fraud/AML Risk Engine": { icon: Network, badge: "Topology & Scoring" },
  "Evidence + RAG Agent": { icon: Bot, badge: "FATF Typologies RAG" },
  "SAR Generator Agent": { icon: FileText, badge: "FinCEN Filing Draft" }
};

export default function AgentExecutionVisualizer({ agentLogs = [], isRunning = false, activeStep = 0, theme }) {
  const [expandedAgent, setExpandedAgent] = useState(null);
  const isLight = theme === 'light';

  const toggleExpand = (agentName) => {
    setExpandedAgent(expandedAgent === agentName ? null : agentName);
  };

  const agentsList = Object.keys(AGENT_META);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              Multi-Agent Swarm Orchestrator
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border animate-pulse"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--text-main)' }}></span>
                  Step {activeStep}/7
                </span>
              )}
            </h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              7-agent pipeline: ML, sanctions, graph analytics & RAG
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
          Completed: <strong style={{ color: 'var(--text-main)' }}>{agentLogs.length}/7</strong>
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {agentsList.map((agentName, idx) => {
          const meta = AGENT_META[agentName];
          const Icon = meta.icon;
          const log = agentLogs.find(l => l.agent === agentName);
          const isDone = !!log;
          const isCurrent = isRunning && activeStep === (idx + 1);
          const isExpanded = expandedAgent === agentName;

          return (
            <div key={agentName}
              className="rounded-xl border transition-all duration-200"
              style={{
                backgroundColor: isDone ? 'var(--bg-card)' : isCurrent ? 'var(--bg-subtle)' : 'var(--bg-card)',
                borderColor: isCurrent ? 'var(--text-main)' : 'var(--border-main)',
                opacity: !isDone && !isCurrent ? 0.5 : 1
              }}
            >
              <div
                onClick={() => isDone && toggleExpand(agentName)}
                className={`p-3.5 flex items-center justify-between ${isDone ? 'cursor-pointer select-none' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: isDone ? (isLight ? '#000' : '#fff') : 'var(--bg-subtle)',
                      color: isDone ? (isLight ? '#fff' : '#000') : 'var(--text-muted)',
                      borderColor: 'var(--border-main)'
                    }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{agentName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold"
                        style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}>
                        {meta.badge}
                      </span>
                    </div>
                    <div className="text-[11px] mt-0.5 line-clamp-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                      {isDone ? log.thought : isCurrent ? (
                        <span className="flex items-center gap-1.5 font-mono font-bold animate-pulse" style={{ color: 'var(--text-main)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--text-main)' }}></span>
                          Executing...
                        </span>
                      ) : 'Awaiting dispatch'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isDone && (
                    <div className="flex items-center gap-2 font-mono text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.execution_time_ms}ms
                      </span>
                      <span className="font-bold px-1.5 py-0.5 rounded border"
                        style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                        {Math.round(log.confidence * 100)}%
                      </span>
                    </div>
                  )}
                  {isDone ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--text-main)' }} /> :
                   isCurrent ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-main)', borderTopColor: 'transparent' }}></div> :
                   <div className="w-4 h-4 rounded-full border" style={{ borderColor: 'var(--border-main)' }}></div>}
                  {isDone && (isExpanded ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />)}
                </div>
              </div>

              {isExpanded && log && (
                <div className="px-4 pb-4 pt-1 border-t text-xs space-y-2 font-mono rounded-b-xl"
                  style={{ borderColor: 'var(--border-main)', backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="p-2.5 rounded border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>Action: </span>{log.action}
                  </div>
                  <div className="p-2.5 rounded border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>Finding: </span>{log.output_summary}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
