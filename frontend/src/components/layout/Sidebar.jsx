import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  UploadCloud, 
  Search, 
  Network, 
  MessageSquare, 
  BookmarkPlus, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Brain,
  Table
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspace', label: 'Workspace', icon: FolderKanban },
  { id: 'papers', label: 'Research Papers', icon: FileText },
  { id: 'comparison-table', label: 'Comparison Table', icon: Table },
  { id: 'upload', label: 'Upload Papers', icon: UploadCloud },
  { id: 'semantic-search', label: 'Semantic Search', icon: Search },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'citation-rec', label: 'Generate Citation', icon: BookmarkPlus },
  { id: 'lit-review', label: 'Literature Review', icon: BookOpen },
  { id: 'research-trends', label: 'Research Trends', icon: TrendingUp },
  { id: 'research-gaps', label: 'Research Gaps', icon: Sparkles },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentView, setCurrentView, isOpen, setIsOpen }) {
  const { logout } = useAuth();

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 bg-clip-text text-transparent">
                SynapsGraph
              </span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-md">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-soft font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
