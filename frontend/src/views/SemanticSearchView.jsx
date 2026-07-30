import React, { useState } from 'react';
import { Search, Filter, Sparkles, Download, ExternalLink, BookOpen, User, Tag, Calendar, ArrowRight } from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function SemanticSearchView() {
  const { activeWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await PaperService.semanticSearch(activeWorkspace?.project_id || 1, query);
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "Transformer attention mechanism parallelization",
    "Dense retrieval augmented generation for factual QA",
    "Graph attention networks for node classification",
    "Deep residual learning image recognition accuracy"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header & Large Input Box */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Vector Similarity Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Semantic Paper Search</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Query indexed sentence embeddings across abstracts with natural language phrases.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto pt-2">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research papers using natural language..."
              className="w-full pl-12 pr-32 py-4 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-soft focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-soft transition-all flex items-center space-x-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>Search</span>}
            </button>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Suggested:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(q); }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Semantic Search Results ({results.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Ranked by Cosine Similarity</span>
          </div>

          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-brand-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer">
                    {res.title}
                  </h4>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex-shrink-0">
                    Similarity: {(res.score * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {res.abstract}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Paper ID: #{res.paper_id}</span>
                  <div className="flex items-center space-x-3">
                    <button className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Preview Paper
                    </button>
                    <button className="text-slate-600 dark:text-slate-300 font-bold hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
