import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Tag, 
  BookmarkPlus, 
  Network, 
  Share2, 
  Search, 
  Sparkles, 
  BookOpen, 
  PlusCircle, 
  TrendingUp,
  Brain
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function DashboardHome({ setCurrentView }) {
  const { activeWorkspace } = useWorkspace();
  const [papers, setPapers] = useState([]);
  const [authorNetwork, setAuthorNetwork] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      setLoading(true);
      Promise.all([
        PaperService.getPapers(activeWorkspace.project_id),
        PaperService.getAuthorNetwork(activeWorkspace.project_id).catch(() => null),
        PaperService.getResearchTimeline(activeWorkspace.project_id).catch(() => null)
      ]).then(([papersRes, authorRes, timelineRes]) => {
        setPapers(papersRes || []);
        setAuthorNetwork(authorRes || null);
        setTimelineData(timelineRes?.timeline || []);
        setLoading(false);
      }).catch(err => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
    }
  }, [activeWorkspace]);

  const totalPapers = papers.length;
  const totalAuthors = authorNetwork?.summary?.total_authors || 0;
  const totalLinks = authorNetwork?.summary?.total_authorship_links || 0;
  const topAuthors = authorNetwork?.top_authors || [];

  const statCards = [
    { label: 'Total Papers', val: totalPapers, icon: FileText, color: 'from-blue-500 to-brand-600' },
    { label: 'Total Authors', val: totalAuthors, icon: Users, color: 'from-indigo-500 to-blue-600' },
    { label: 'Authorship Links', val: totalLinks, icon: Share2, color: 'from-purple-500 to-indigo-600' },
    { label: 'Timeline Months', val: timelineData.length, icon: TrendingUp, color: 'from-sky-500 to-brand-500' },
    { label: 'Neo4j Graph Nodes', val: totalPapers + totalAuthors, icon: Network, color: 'from-brand-500 to-indigo-500' },
    { label: 'Graph Relationships', val: totalLinks, icon: BookmarkPlus, color: 'from-blue-600 to-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white shadow-glow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Active Workspace: {activeWorkspace?.name || "No Workspace Selected"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Research Dashboard</h1>
          <p className="text-sm text-blue-100 opacity-90">
            {activeWorkspace?.description || "Explore papers, author networks, and AI analysis directly from your backend."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setCurrentView('upload')}
            className="px-5 py-3 rounded-2xl bg-white text-brand-600 hover:bg-brand-50 font-bold text-xs shadow-soft transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Papers</span>
          </button>
          <button
            onClick={() => setCurrentView('ai-chat')}
            className="px-5 py-3 rounded-2xl bg-brand-700/60 hover:bg-brand-700 border border-white/30 text-white font-bold text-xs transition-all flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>Launch AI Chat</span>
          </button>
        </div>
      </div>

      {/* 6 Backend Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-soft`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : c.val}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid consuming real backend timeline & author stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Paper Upload Timeline Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Research Upload Timeline</h3>
              <p className="text-xs text-slate-500">Monthly upload count returned by GET /timeline.</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No timeline records available yet. Upload PDF papers to build timeline.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="paper_count" name="Papers Uploaded" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPapers)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Authors List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Authors</h3>
            <p className="text-xs text-slate-500">Backend GET /author-network leaderboard.</p>
          </div>

          <div className="space-y-3 pt-2">
            {topAuthors.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No authors found in graph yet.
              </div>
            ) : (
              topAuthors.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{a.name}</span>
                  <span className="px-2.5 py-1 rounded-full font-bold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    {a.paper_count} Papers
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('semantic-search')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 transition-all text-left group"
            >
              <Search className="w-5 h-5 text-brand-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Semantic Search</div>
              <div className="text-[10px] text-slate-400">Query Qdrant embeddings</div>
            </button>

            <button
              onClick={() => setCurrentView('knowledge-graph')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 transition-all text-left group"
            >
              <Network className="w-5 h-5 text-brand-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Knowledge Graph</div>
              <div className="text-[10px] text-slate-400">Explore Neo4j network</div>
            </button>

            <button
              onClick={() => setCurrentView('lit-review')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 transition-all text-left group"
            >
              <BookOpen className="w-5 h-5 text-brand-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Literature Review</div>
              <div className="text-[10px] text-slate-400">Synthesize review article</div>
            </button>

            <button
              onClick={() => setCurrentView('research-gaps')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 transition-all text-left group"
            >
              <Sparkles className="w-5 h-5 text-brand-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Research Gaps</div>
              <div className="text-[10px] text-slate-400">Identify under-explored areas</div>
            </button>
          </div>
        </div>

        {/* Recent Uploaded Papers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Papers</h3>

          <div className="space-y-3">
            {papers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No papers uploaded in this workspace yet.
              </div>
            ) : (
              papers.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{p.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'Unknown author'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
