import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { api } from '../services/api';

export default function CopilotChat({ caseContext, theme }) {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState([{
    sender: 'bot',
    text: `Hello, Investigator. I am your FinGuard AI AML Copilot. Ask me anything regarding FATF typologies, counterparty risk, or SAR narrative justification for ${caseContext?.customer_name || 'this case'}.`,
    timestamp: new Date().toLocaleTimeString()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { sender: 'user', text: input, timestamp: new Date().toLocaleTimeString() }]);
    const currentInput = input; setInput(''); setLoading(true);
    try {
      const res = await api.sendCopilotChat(currentInput, caseContext || {});
      setMessages(prev => [...prev, { sender: 'bot', text: res.reply, referenced: res.referenced_typologies, timestamp: new Date().toLocaleTimeString() }]);
    } catch { setMessages(prev => [...prev, { sender: 'bot', text: 'Error querying intelligence. Try again.', timestamp: new Date().toLocaleTimeString() }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-[520px]">
      <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
        <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
          style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>FinGuard Copilot</h3>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Interactive AML Forensic Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: m.sender === 'user' ? (isLight ? '#000' : '#fff') : 'var(--bg-subtle)',
                color: m.sender === 'user' ? (isLight ? '#fff' : '#000') : 'var(--text-main)',
                border: `1px solid var(--border-main)`
              }}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className="max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap border"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
              <div className="text-[10px] font-mono mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>{m.timestamp}</div>
              {m.text}
              {m.referenced?.length > 0 && (
                <div className="mt-2 pt-2 border-t text-[10px] font-mono font-bold" style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                  Cited: {m.referenced.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold animate-pulse" style={{ color: 'var(--text-main)' }}>
            <Bot className="w-4 h-4" /> Analyzing regulatory RAG database...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about structuring thresholds, PEP rules, circular flows..."
          className="flex-1 border rounded-lg px-3.5 py-2 text-xs focus:outline-none font-sans"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
        <button type="submit" disabled={loading || !input.trim()}
          className="p-2 rounded-lg disabled:opacity-50 cursor-pointer border"
          style={{ backgroundColor: isLight ? '#000' : '#fff', color: isLight ? '#fff' : '#000', borderColor: 'var(--border-main)' }}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
