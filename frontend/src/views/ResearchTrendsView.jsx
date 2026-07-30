import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ResearchTrendsView() {
  const { activeWorkspace } = useWorkspace();
  const [timeline, setTimeline] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      setLoading(true);
      Promise.all([
        PaperService.getResearchTimeline(activeWorkspace.project_id).catch(() => null),
        PaperService.getAuthorNetwork(activeWorkspace.project_id).catch(() => null)
      ]).then(([timelineRes, networkRes]) => {
        setTimeline(timelineRes?.timeline || []);
        setTopAuthors(networkRes?.top_authors || []);
        setLoading(false);
      });
    }
  }, [activeWorkspace]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Research Trends</h1>
        <p className="text-xs text-slate-500">Real publication velocity and author productivity returned by backend endpoints.</p>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Publication Velocity Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Publication Velocity (GET /timeline)
            </h3>
          </div>

          <div className="h-64 w-full pt-4">
            {timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No timeline records available yet. Upload PDF papers to build timeline.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="paper_count" name="Papers Uploaded" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Authors Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" /> Author Publication Productivity (GET /author-network)
          </h3>

          <div className="h-64 w-full pt-4">
            {topAuthors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No author records available in graph yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAuthors} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                  <Tooltip />
                  <Bar dataKey="paper_count" name="Papers" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
