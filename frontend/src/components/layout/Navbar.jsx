import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  FolderKanban, 
  User, 
  Check, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuToggle, onOpenSearch, theme, toggleTheme, setCurrentView }) {
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Knowledge Graph Built', desc: 'Neo4j parsed 5 new paper relationships', time: '2m ago' },
    { id: 2, title: 'Embedding Index Updated', desc: 'Vector points stored in Qdrant', time: '15m ago' },
    { id: 3, title: 'New Gap Analysis Ready', desc: 'Gemini 3.6 Flash detected 3 novel research gaps', time: '1h ago' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Workspace Indicator */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
          >
            <FolderKanban className="w-4 h-4 text-brand-500" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-48 overflow-y-auto my-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.project_id}
                    onClick={() => {
                      selectWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200"
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.project_id === ws.project_id && (
                      <Check className="w-4 h-4 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="px-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    setCurrentView('workspace');
                  }}
                  className="w-full text-center px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                >
                  + Switch / Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Search Box */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={() => {
            if (onOpenSearch) onOpenSearch();
            else setCurrentView('semantic-search');
          }}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search papers, concepts, authors...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50">
              <div className="px-4 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-500" /> Notifications
                </span>
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400 cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div 
          onClick={() => setCurrentView('settings')}
          className="flex items-center space-x-2.5 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-soft">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
              {user?.username || 'Dr. Alex Rivera'}
            </div>
            <div className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
              Pro Researcher
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
