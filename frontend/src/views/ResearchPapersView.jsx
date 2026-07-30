import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  BookOpen, 
  User, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ResearchPapersView() {
  const { activeWorkspace } = useWorkspace();
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      setLoading(true);
      PaperService.getPapers(activeWorkspace.project_id).then(res => {
        setPapers(res || []);
        setLoading(false);
      });
    }
  }, [activeWorkspace]);

  const filteredPapers = papers.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authors?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Research Papers</h1>
          <p className="text-xs text-slate-500">Manage and explore indexed document collection.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, author..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Paper Title</th>
                <th className="py-3.5 px-4">Authors</th>
                <th className="py-3.5 px-4">Uploaded / Year</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredPapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-brand-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{paper.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{paper.filename}</div>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="text-slate-700 dark:text-slate-300 truncate">
                      {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || 'Unknown'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-500 font-medium">
                      {paper.uploaded_at ? new Date(paper.uploaded_at).toLocaleDateString() : '2026'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Indexed
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => setSelectedPaper(paper)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paper Preview Drawer Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-end p-4 sm:p-6">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 overflow-y-auto max-h-[90vh] animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-brand-500 uppercase">Paper Details</span>
              <button onClick={() => setSelectedPaper(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPaper.title}</h2>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Authors</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {Array.isArray(selectedPaper.authors) ? selectedPaper.authors.join(', ') : selectedPaper.authors}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Abstract</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {selectedPaper.abstract || "No abstract details available."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
