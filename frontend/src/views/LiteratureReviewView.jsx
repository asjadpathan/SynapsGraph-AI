import React, { useState } from 'react';
import { BookOpen, Sparkles, Download, FileText, FileCode } from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function LiteratureReviewView() {
  const { activeWorkspace } = useWorkspace();
  const [topic, setTopic] = useState('');
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() || !activeWorkspace?.project_id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await PaperService.generateLiteratureReview(activeWorkspace.project_id, topic);
      setReviewData(res);
    } catch (err) {
      console.error("Literature review fetch error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to generate literature review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
          <BookOpen className="w-4 h-4" />
          <span>Backend Review Generator</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Literature Review Synthesizer</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Synthesizes primary sources using backend GET /literature-review.
        </p>
      </div>

      {/* Topic Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Enter Literature Review Topic</label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Scalability of Self-Attention Mechanisms"
            className="w-full sm:flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Synthesize Review</span><Sparkles className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Review Output */}
      {reviewData && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{reviewData.topic}</h2>
              <span className="text-xs text-slate-400">Papers used: {reviewData.papers_used || 0}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 whitespace-pre-wrap font-sans">
            {reviewData.review}
          </div>

          {reviewData.sources && reviewData.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Sources Consulted</span>
              <div className="flex flex-wrap gap-2">
                {reviewData.sources.map((src, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {src.title} (Score: {(src.score * 100).toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
