import React, { useState, useEffect } from 'react';
import { BookmarkPlus, ArrowRight, Copy, Check } from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function CitationRecommendationView() {
  const { activeWorkspace } = useWorkspace();

  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      PaperService.getPapers(activeWorkspace.project_id)
        .then(res => {
          const list = res || [];
          setPapers(list);

          if (list.length > 0) {
            setSelectedPaperId(list[0].id);
          } else {
            setSelectedPaperId('');
          }

          setCitation('');
          setError('');
        })
        .catch(err => {
          console.error('Error fetching papers:', err);
          setError('Unable to load papers.');
        });
    }
  }, [activeWorkspace]);

  const handleGenerateCitation = async () => {
    if (!selectedPaperId || !activeWorkspace?.project_id) return;

    setLoading(true);
    setCitation('');
    setError('');
    setCopied(false);

    try {
      const res = await PaperService.getPaperCitation(
        activeWorkspace.project_id,
        selectedPaperId
      );

      setCitation(res?.citation || '');
    } catch (err) {
      console.error('Citation generation error:', err);
      setError(
        err?.response?.data?.detail ||
        'Unable to generate citation.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCitation = async () => {
    if (!citation) return;

    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const selectedPaper = papers.find(
    paper => String(paper.id) === String(selectedPaperId)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
          <BookmarkPlus className="w-4 h-4" />
          <span>IEEE Citation Generator</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Paper Citation
        </h1>

        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Select a research paper to generate its IEEE reference citation.
        </p>
      </div>

      {/* Paper Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Select Research Paper
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-4">

          <select
            value={selectedPaperId}
            onChange={(e) => {
              setSelectedPaperId(e.target.value);
              setCitation('');
              setError('');
            }}
            className="w-full sm:flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-brand-500"
          >
            {papers.length === 0 ? (
              <option value="">No papers available</option>
            ) : (
              papers.map(paper => (
                <option key={paper.id} value={paper.id}>
                  {paper.title || paper.filename}
                </option>
              ))
            )}
          </select>

          <button
            onClick={handleGenerateCitation}
            disabled={loading || !selectedPaperId}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Generate Citation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>

        {selectedPaper && (
          <div className="pt-2 text-xs text-slate-400">
            Selected Paper: <span className="font-semibold">{selectedPaper.title}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Citation Result */}
      {citation && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                IEEE Reference
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Generated from the selected paper's metadata.
              </p>
            </div>

            <button
              onClick={handleCopyCitation}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {citation}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}