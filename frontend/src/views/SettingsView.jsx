import React, { useState } from 'react';
import { User, Bell, Palette, Lock, FolderKanban, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export default function SettingsView({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: FolderKanban },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account & Security', icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500">Manage account, workspace configuration, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* Left Tabs */}
        <div className="w-full md:w-56 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Panel */}
        <div className="flex-1 space-y-6">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">User Profile</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  defaultValue={user?.username || 'Dr. Alex Rivera'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email || 'alex.rivera@research.ai'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-soft">
                Save Changes
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Theme & Display</h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Mode</div>
                  <div className="text-[10px] text-slate-400">Toggle between light and dark UI themes</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs"
                >
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Current Workspace</h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{activeWorkspace?.name || 'Default Project'}</div>
                <div className="text-xs text-slate-500">{activeWorkspace?.description || 'Standard scientific research scope'}</div>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'account') && (
            <div className="p-4 text-xs text-slate-500">
              Settings configured automatically for optimal AI analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
