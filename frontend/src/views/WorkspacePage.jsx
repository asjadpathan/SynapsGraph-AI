import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  FolderPlus, 
  Search, 
  ArrowRight, 
  FileText, 
  Clock, 
  User, 
  Sparkles, 
  Brain,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function WorkspacePage({ onSelectWorkspace, onCreateWorkspaceClick }) {
  const { workspaces, selectWorkspace, createWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setLoading(true);
    try {
      const created = await createWorkspace(newWsName, newWsDesc);
      selectWorkspace(created);
      onCreateWorkspaceClick();
    } catch (err) {
      console.error("Workspace creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-12 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Top Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Workspace Selection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to SynapsGraph AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Choose an existing workspace to continue your research, or create a new dedicated scope.
          </p>
        </div>

        {/* Two Large Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Existing Workspace */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Existing Workspaces</h2>
                    <p className="text-xs text-slate-500">Continue working on your previous projects.</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Workspace..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Workspaces List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {filteredWorkspaces.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No workspaces found. Create a new one on the right.
                  </div>
                ) : (
                  filteredWorkspaces.map((ws) => (
                    <div
                      key={ws.project_id}
                      onClick={() => {
                        selectWorkspace(ws);
                        onSelectWorkspace(ws);
                      }}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                          {ws.name}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-brand-500" /> {ws.paper_count || 0} Papers</span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> Owner</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(ws.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all flex items-center gap-1 shadow-sm">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Create New Workspace */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create New Workspace</h2>
                  <p className="text-xs text-slate-500">Initialize a dedicated scientific project scope.</p>
                </div>
              </div>

              {/* Illustration: Folder + AI */}
              <div className="w-full h-32 rounded-2xl bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-blue-500/5 border border-brand-200/50 dark:border-brand-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-soft flex items-center justify-center text-brand-500">
                    <FolderKanban className="w-8 h-8" />
                  </div>
                  <Sparkles className="w-6 h-6 text-brand-400 animate-bounce" />
                  <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white shadow-glow flex items-center justify-center">
                    <Brain className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    required
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder="e.g. Generative AI in Drug Discovery"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workspace Description</label>
                  <textarea
                    rows={2}
                    value={newWsDesc}
                    onChange={(e) => setNewWsDesc(e.target.value)}
                    placeholder="Brief description of research focus or paper collection..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
