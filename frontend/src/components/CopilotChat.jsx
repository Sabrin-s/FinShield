import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function CopilotChat({ caseContext }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello, Investigator. I am your FinGuard AI AML Copilot. Ask me anything regarding FATF typologies, counterparty risk, or SAR narrative justification for ${caseContext?.customer_name || 'this case'}.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendCopilotChat(currentInput, caseContext || {});
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply,
          referenced: res.referenced_typologies,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Encountered an issue querying regulatory intelligence. Please try again.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            FinGuard Copilot <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </h3>
          <p className="text-xs text-slate-400">Interactive AML Forensic Assistant</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
              m.sender === 'user' ? 'bg-indigo-600' : 'bg-cyan-600'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
              m.sender === 'user' 
                ? 'bg-indigo-950/60 border border-indigo-800 text-slate-200' 
                : 'bg-slate-900/80 border border-slate-800 text-slate-300'
            }`}>
              <div className="text-[10px] text-slate-400 font-mono mb-1">{m.timestamp}</div>
              {m.text}

              {m.referenced && m.referenced.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
                  <span>Cited Typologies: </span>
                  {m.referenced.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Analyzing regulatory RAG database...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about structuring thresholds, PEP rules, circular flows..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
