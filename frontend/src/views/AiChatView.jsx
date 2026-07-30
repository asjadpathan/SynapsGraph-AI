import React, { useState } from 'react';
import { 
  Send, 
  Brain, 
  User, 
  Plus, 
  MessageSquare, 
  BookOpen
} from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AiChatView() {
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your AI Assistant powered by backend Gemini 3.6 Flash. Ask any research question grounded in your uploaded workspace papers.",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async (questionText) => {
    const textToQuery = questionText || input;
    if (!textToQuery.trim() || loading || !activeWorkspace?.project_id) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToQuery };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await PaperService.askQuestion(activeWorkspace.project_id, textToQuery);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.answer,
        sources: res.sources || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Chat error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to fetch response from backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Left Chat Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-4 hidden md:flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
        <div className="space-y-4">
          <button
            onClick={() => setMessages([messages[0]])}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Chat</span>
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 text-xs">
          <span className="font-bold text-brand-600 dark:text-brand-400 block mb-0.5">Gemini 3.6 Flash</span>
          <span className="text-slate-500 text-[10px]">Strictly grounded to workspace Qdrant vector payload.</span>
        </div>
      </div>

      {/* Main Chat Center */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-brand-500 text-white shadow-soft'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl p-4 rounded-3xl text-xs leading-relaxed space-y-3 ${
                m.sender === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
              }`}>
                <p className="whitespace-pre-wrap font-sans">{m.text}</p>

                {/* Sources list */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources Consulted:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((src, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {src.title} (Score: {(src.score * 100).toFixed(1)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-200" />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a scientific question about your workspace paper collection..."
              className="w-full pl-4 pr-12 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
