import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Layers, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Network,
  Zap
} from 'lucide-react';

const AGENT_META = {
  "Planner Agent": {
    icon: Layers,
    color: "from-blue-500 to-indigo-600",
    border: "border-blue-500/40",
    badge: "Hypothesis & Scope"
  },
  "Transaction Agent": {
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/40",
    badge: "Ledger ML & Velocity"
  },
  "KYC & Entity Agent": {
    icon: Search,
    color: "from-purple-500 to-pink-600",
    border: "border-purple-500/40",
    badge: "PEP & Corporate CDD"
  },
  "Sanction & Document Agent": {
    icon: ShieldCheck,
    color: "from-rose-500 to-red-600",
    border: "border-rose-500/40",
    badge: "OFAC SDN Matching"
  },
  "Fraud/AML Risk Engine": {
    icon: Network,
    color: "from-cyan-500 to-blue-600",
    border: "border-cyan-500/40",
    badge: "Topology & Scoring"
  },
  "Evidence + RAG Agent": {
    icon: Bot,
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-500/40",
    badge: "FATF Typologies RAG"
  },
  "SAR Generator Agent": {
    icon: FileText,
    color: "from-indigo-500 to-cyan-500",
    border: "border-indigo-500/40",
    badge: "FinCEN Filing Draft"
  }
};

export default function AgentExecutionVisualizer({ agentLogs = [], isRunning = false, activeStep = 0 }) {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const toggleExpand = (agentName) => {
    setExpandedAgent(expandedAgent === agentName ? null : agentName);
  };

  const agentsList = Object.keys(AGENT_META);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Autonomous Multi-Agent Swarm Orchestrator
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Active Step {activeStep}/7
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Coordinated 7-agent pipeline synthesizing behavioral ML, sanctions, graph analytics & RAG precedents
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-400">
            Completed: <strong className="text-cyan-300">{agentLogs.length}/7</strong> Agents
          </span>
        </div>
      </div>

      {/* Agents Timeline List */}
      <div className="space-y-2.5 pt-1">
        {agentsList.map((agentName, idx) => {
          const meta = AGENT_META[agentName];
          const Icon = meta.icon;
          const log = agentLogs.find(l => l.agent === agentName);
          const isDone = !!log;
          const isCurrent = isRunning && activeStep === (idx + 1);
          const isPending = !isDone && !isCurrent;
          const isExpanded = expandedAgent === agentName;

          return (
            <div 
              key={agentName}
              className={`rounded-xl border transition-all duration-200 ${
                isDone 
                  ? 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700' 
                  : isCurrent 
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              {/* Row Header */}
              <div 
                onClick={() => isDone && toggleExpand(agentName)}
                className={`p-3.5 flex items-center justify-between ${isDone ? 'cursor-pointer select-none' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon & Stage Badge */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${meta.color} shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{agentName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {meta.badge}
                      </span>
                    </div>
                    {/* Live Thought Line */}
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {isDone ? (
                        <span>{log.thought}</span>
                      ) : isCurrent ? (
                        <span className="text-cyan-300 flex items-center gap-1.5 font-mono animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          Executing forensic query and analysis...
                        </span>
                      ) : (
                        <span className="text-slate-400">Awaiting orchestrator dispatch</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status */}
                <div className="flex items-center gap-3">
                  {isDone && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {log.execution_time_ms}ms
                      </span>
                      <span className="text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                        {Math.round(log.confidence * 100)}% Conf
                      </span>
                    </div>
                  )}

                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-800"></div>
                  )}

                  {isDone && (
                    <div className="text-slate-400 hover:text-slate-200">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Forensic Detail Drawer */}
              {isExpanded && log && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-xs space-y-2 font-mono bg-slate-950/50 rounded-b-xl">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                    <span className="text-cyan-400 font-semibold">Action Executed: </span>
                    {log.action}
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-semibold">Key Finding: </span>
                    {log.output_summary}
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
