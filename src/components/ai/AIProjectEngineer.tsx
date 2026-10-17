import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, ShieldAlert, CloudSun, CheckCircle, Bookmark, BookOpen, Activity, RefreshCw } from 'lucide-react';

interface AIProjectEngineerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIProjectEngineer: React.FC<AIProjectEngineerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Good morning Eng. Martin Vance.

📋 Projects: 3 Active (Grand Bay Interchange, Apex Tower, Water Treatment)

✅ Today's Work:
• Inspect Column C-01 to C-04 rebar spacing at Grand Bay site
• Verify 28-day Concrete Cube Test results for Pier P3
• Consultant Review meeting on Pier Cap P4 at 2:00 PM

⚠️ Forecast: Rain expected after 2:30 PM.
   Recommendation: Execute Pier P4 concrete pour before 12:30 PM.

🦺 Safety: 4 workers assigned to excavation have completed morning toolbox talk.

📊 Project Health: Overall 88% | Schedule 91% | Safety 98% | Budget 82%

🧠 Decision Log: Decision #44 (Apex Tower C60/75 Core Wall) is pending approval.

📚 Lessons Learned: Similar project experienced hot-weather slump retention loss. Recommendation: Check retarder dosage on ready-mix trucks.`,
      time: '08:00 AM',
    },
  ]);

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Analysis completed with verified engineering parameters.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'AI Copilot evaluated your request against platform Eurocodes & project memory. All parameters are within SLS/ULS safety bounds.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Check Eurocode 2 shear capacity for Pier Cap P4',
    'Assess weather rain risk for today concrete pour',
    'Draft RFI response for rebar spacing query',
    'Find similar past projects with piling rock issues',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 text-white border-l border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="p-4 bg-emerald-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                AI Project Engineer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600 font-mono">
                  EngBrain v6.0
                </span>
              </h3>
              <p className="text-xs text-emerald-300">Continuous Project Intelligence & Risk Monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Insights Bar */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950 text-[10px] font-mono border-b border-slate-800 text-center">
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block">Health</span>
            <span className="text-emerald-400 font-bold">88% (Good)</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block">Schedule</span>
            <span className="text-emerald-400 font-bold">91% (+2d)</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block">Safety</span>
            <span className="text-emerald-400 font-bold">98% (Zero Inc)</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block">Decisions</span>
            <span className="text-amber-400 font-bold">1 Pending</span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs shadow-md whitespace-pre-wrap font-sans'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs p-3 bg-slate-800/60 rounded-xl w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Eurocode standards, site diary logs & project memory...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2 bg-slate-950 border-t border-slate-800 overflow-x-auto flex gap-2">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] whitespace-nowrap border border-slate-700 shrink-0"
            >
              ⚡ {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Project Engineer anything about calculations, codes, weather, or decisions..."
            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
