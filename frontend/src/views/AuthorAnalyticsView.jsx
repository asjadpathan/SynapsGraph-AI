import React, { useState, useEffect } from 'react';
import { Users, Award, BookOpen, Network, Share2 } from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AuthorAnalyticsView() {
  const { activeWorkspace } = useWorkspace();
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      setLoading(true);
      PaperService.getAuthorNetwork(activeWorkspace.project_id)
        .then(res => {
          setNetworkData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error("Author network fetch error:", err);
          setLoading(false);
        });
    }
  }, [activeWorkspace]);

  const summary = networkData?.summary || { total_authors: 0, total_papers: 0, total_authorship_links: 0 };
  const topAuthors = networkData?.top_authors || [];
  const collaborations = networkData?.collaborations_by_paper || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Author Analytics & Collaboration Network</h1>
        <p className="text-xs text-slate-500">Co-authorship links, publication counts, and author metrics directly from Neo4j backend.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : summary.total_authors}</div>
            <div className="text-xs font-semibold text-slate-500">Total Authors</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : summary.total_papers}</div>
            <div className="text-xs font-semibold text-slate-500">Indexed Papers</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : summary.total_authorship_links}</div>
            <div className="text-xs font-semibold text-slate-500">Authorship Links</div>
          </div>
        </div>
      </div>

      {/* Top Authors & Collaboration Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Authors Leaderboard */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Top Researchers in Corpus
          </h3>

          <div className="space-y-3">
            {topAuthors.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No author records available in graph yet.
              </div>
            ) : (
              topAuthors.map((author, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{author.name}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    {author.paper_count} Papers
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Co-Authorship Papers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-500" /> Multi-Author Collaboration Papers
          </h3>

          <div className="space-y-3">
            {collaborations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No multi-author collaboration papers recorded yet.
              </div>
            ) : (
              collaborations.map((collab, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{collab.paper_title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {collab.authors.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {a}
                      </span>
                    ))}
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
