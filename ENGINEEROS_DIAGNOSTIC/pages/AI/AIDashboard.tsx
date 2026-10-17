import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';

const AIDashboard = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Good morning Martin. Projects: 8 Active. Today's Work: Inspect Columns B1–B12. Forecast: Rain expected after 3 PM. Recommendation: Pour concrete before 1 PM." },
    { role: 'user', content: 'What is the status of Project Alpha?' },
    { role: 'ai', content: 'Project Alpha is 45% complete. Currently in the foundation phase. 3 RFIs are pending. The concrete pour is scheduled for tomorrow.' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    setMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'ai', content: "I've analyzed your query. Would you like me to provide more details about the project schedule?" }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Project Engineer</h1>
        <span className="flex items-center gap-2 text-sm text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </span>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto min-h-[400px]">
        <div className="space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {msg.role === 'ai' && <Bot size={14} className="inline mr-2" />}
                <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI Project Engineer..."
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          onClick={handleSend}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIDashboard;
