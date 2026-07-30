import React, { useState, useEffect } from 'react';
import { BookmarkPlus, Search, Sparkles, BookOpen, ArrowRight, Download } from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function CitationRecommendationView() {
  const { activeWorkspace } = useWorkspace();
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      PaperService.getPapers(activeWorkspace.project_id).then(res => {
        const list = res || [];
        setPapers(list);
        if (list.length > 0) {
          setSelectedPaperId(list[0].id);
        }
      });
    }
  }, [activeWorkspace]);

  const handleRecommend = async () => {
    if (!selectedPaperId || !activeWorkspace?.project_id) return;
    setLoading(true);
    try {
      const res = await PaperService.recommendCitations(activeWorkspace.project_id, selectedPaperId);
      setRecommendations(res);
    } catch (err) {
      console.error("Citation recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
          <BookmarkPlus className="w-4 h-4" />
          <span>Backend Vector Search</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Citation Recommendations</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Vector recommendations returned directly by GET /recommend-citations.
        </p>
      </div>

      {/* Seed Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Seed Research Paper</label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="w-full sm:flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-brand-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>{p.title || p.filename}</option>
            ))}
          </select>

          <button
            onClick={handleRecommend}
            disabled={loading || !selectedPaperId}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Find Citations</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {/* Recommended List */}
      {recommendations && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommendations for "{recommendations.source_paper?.title}"
            </h3>
          </div>

          <div className="space-y-4">
            {recommendations.recommended_citations?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No recommended citations found in Qdrant index.
              </div>
            ) : (
              recommendations.recommended_citations?.map((rec, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                      Similarity Score: {(rec.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rec.abstract}</p>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Paper ID: #{rec.paper_id}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
