import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Search, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  FileQuestion,
  Sparkles,
  X
} from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ComparisonTableView() {
  const { activeWorkspace } = useWorkspace();
  
  // Data state & caching per project
  const [data, setData] = useState(null);
  const [cachedProjectId, setCachedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Controls state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null); // 'title' | 'venue' | 'year'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Toast state for cell copy feedback
  const [copiedCellId, setCopiedCellId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch comparison table data from backend
  const fetchTableData = async (forceRefresh = false) => {
    const projectId = activeWorkspace?.project_id || activeWorkspace?.id;

    if (!projectId) return;
    
    // Check cache
    if (!forceRefresh && cachedProjectId === projectId && data) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await PaperService.getComparisonTable(projectId);
      console.log(res);
      console.log(res?.rows);
      console.log(res?.total_papers);
      setData(res);
      setCachedProjectId(projectId);
    } catch (err) {
      console.error("Failed to load comparison table:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on workspace change or mount
  useEffect(() => {
    const projectId = activeWorkspace?.project_id || activeWorkspace?.id;
    if (projectId) {
      if (cachedProjectId !== projectId) {
        fetchTableData(true);
      }
    }
  }, [activeWorkspace?.project_id, activeWorkspace?.id]);
// Helper to extract year
const extractYear = (row) => {
  if (row.publication_year) {
    return parseInt(row.publication_year, 10);
  }
  return 0;
};

  // Format authors array or string to comma separated text
  const formatAuthors = (authors) => {
    if (Array.isArray(authors)) return authors.join(', ');
    return authors || 'Not specified';
  };

  // Filtered & Sorted dataset computation
  const processedRows = useMemo(() => {
    const responseData = data?.data || data;
    const rawRows = Array.isArray(responseData) 
      ? responseData 
      : (responseData?.rows || responseData?.table_rows || responseData?.papers || []);

    if (!rawRows || !rawRows.length) return [];

    // 1. Search filtering across Title, Authors, Venue, Datasets, Methods, Results, Gaps
    const query = searchTerm.trim().toLowerCase();
    let filtered = rawRows;

    if (query) {
      filtered = rawRows.filter(row => {
        const titleStr = (row.title || '').toLowerCase();
        const authorsStr = formatAuthors(row.authors).toLowerCase();
        const venueStr = (
          `${row.conference_journal_name || ""} ${row.publication_year || ""}`
        ).toLowerCase();
        const datasetsStr = (row.datasets || '').toLowerCase();
        const methodsStr = (row.methods || '').toLowerCase();
        const resultsStr = (row.results || '').toLowerCase();
        const gapsStr = (row.gaps || '').toLowerCase();

        return (
          titleStr.includes(query) ||
          authorsStr.includes(query) ||
          venueStr.includes(query) ||
          datasetsStr.includes(query) ||
          methodsStr.includes(query) ||
          resultsStr.includes(query) ||
          gapsStr.includes(query)
        );
      });
    }

    // 2. Sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let valA = '';
        let valB = '';

        if (sortField === 'title') {
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
        } else if (sortField === 'venue') {
          valA = (a.conference_journal_name || '').toLowerCase();
          valB = (b.conference_journal_name || '').toLowerCase();
        } else if (sortField === 'year') {
          valA = extractYear(a);
          valB = extractYear(b);
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Log state updates as required by debugging instructions
  useEffect(() => {
    console.log("ComparisonTableView -> data:", data);
  }, [data]);

  useEffect(() => {
    console.log("ComparisonTableView -> processedRows:", processedRows);
    console.log("ComparisonTableView -> processedRows.length:", processedRows.length);
  }, [processedRows]);

  // Reset page number on search or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, pageSize]);

  // Pagination slicing
  const totalItems = processedRows.length;
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalItems / (pageSize || 10));
  const currentPageSafe = Math.min(currentPage, totalPages || 1);
  
  const displayedRows = useMemo(() => {
    if (pageSize === 'all') return processedRows;
    const size = Number(pageSize);
    const start = (currentPageSafe - 1) * size;
    return processedRows.slice(start, start + size);
  }, [processedRows, currentPageSafe, pageSize]);

  // Mandatory Debug Logs after every render
  console.log("ComparisonTableView render -> data:", data);
  console.log("ComparisonTableView render -> processedRows:", processedRows);
  console.log("ComparisonTableView render -> processedRows.length:", processedRows.length);
  console.log("ComparisonTableView render -> displayedRows:", displayedRows);
  console.log("ComparisonTableView render -> displayedRows.length:", displayedRows.length);

  // Column sort click handler
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Cell Copy to Clipboard Handler
  const handleCopyCell = (text, cellKey) => {
    if (!text) return;
    const content = typeof text === 'string' ? text : String(text);
    navigator.clipboard.writeText(content).then(() => {
      setCopiedCellId(cellKey);
      setToastMessage("Copied to clipboard!");
      setTimeout(() => {
        setCopiedCellId(null);
        setToastMessage(null);
      }, 2000);
    }).catch((err) => {
      console.error("Copy failed:", err);
    });
  };

  // Clean String for Exports
  const cleanExportText = (val) => {
    if (val === null || val === undefined) return '';
    if (Array.isArray(val)) return val.join(', ');
    return String(val).replace(/\r?\n|\r/g, ' ').trim();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!processedRows.length) return;
    const headers = [
      "Title", 
      "Authors", 
      "Conference / Journal & Year", 
      "Datasets", 
      "Research Methods", 
      "Results / Findings", 
      "Research Gaps / Limitations"
    ];

    const csvRows = [
      headers.join(','),
      ...processedRows.map(row => [
        `"${cleanExportText(row.title).replace(/"/g, '""')}"`,
        `"${cleanExportText(formatAuthors(row.authors)).replace(/"/g, '""')}"`,
        `"${cleanExportText(
  `${row.conference_journal_name || ""} ${row.publication_year || ""}`
).replace(/"/g, '""')}"`
        `"${cleanExportText(row.datasets).replace(/"/g, '""')}"`,
        `"${cleanExportText(row.methods).replace(/"/g, '""')}"`,
        `"${cleanExportText(row.results).replace(/"/g, '""')}"`,
        `"${cleanExportText(row.gaps).replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Comparison_Table_${activeWorkspace?.name || 'Project'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel Export Handler (.xlsx via Spreadsheet ML / HTML Table)
  const handleExportExcel = () => {
    if (!processedRows.length) return;
    const headers = [
      "Title", 
      "Authors", 
      "Conference / Journal & Year", 
      "Datasets", 
      "Research Methods", 
      "Results / Findings", 
      "Research Gaps / Limitations"
    ];

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"/><style>
      table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
      th { background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #334155; padding: 10px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
      tr:nth-child(even) { background-color: #f8fafc; }
    </style></head><body>`;
    html += `<table><thead><tr>`;
    headers.forEach(h => { html += `<th>${h}</th>`; });
    html += `</tr></thead><tbody>`;

    processedRows.forEach(row => {
      html += `<tr>
        <td><b>${cleanExportText(row.title)}</b></td>
        <td>${cleanExportText(formatAuthors(row.authors))}</td>
        <td>${cleanExportText(
  `${row.conference_journal_name || ""} ${row.publication_year || ""}`
)}</td>
        <td>${cleanExportText(row.datasets)}</td>
        <td>${cleanExportText(row.methods)}</td>
        <td>${cleanExportText(row.results)}</td>
        <td>${cleanExportText(row.gaps)}</td>
      </tr>`;
    });

    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Comparison_Table_${activeWorkspace?.name || 'Project'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Handler via Printable HTML Frame
  const handleExportPDF = () => {
    if (!processedRows.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }

    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comparison Table - ${activeWorkspace?.name || 'Research Papers'}</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 0; }
          h1 { font-size: 18px; margin-bottom: 4px; color: #0f172a; }
          p.subtitle { color: #64748b; margin-top: 0; margin-bottom: 16px; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; word-wrap: break-word; }
          th { background-color: #1e293b; color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 9px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .title-cell { font-weight: 700; color: #0f172a; }
        </style>
      </head>
      <body>
        <h1>Research Papers Comparison Table</h1>
        <p class="subtitle">Workspace: ${activeWorkspace?.name || 'Default'} | Generated: ${new Date().toLocaleDateString()} | Total Papers: ${processedRows.length}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Title</th>
              <th style="width: 12%;">Authors</th>
              <th style="width: 11%;">Venue & Year</th>
              <th style="width: 15%;">Datasets</th>
              <th style="width: 15%;">Methods</th>
              <th style="width: 16%;">Results / Findings</th>
              <th style="width: 16%;">Gaps / Limitations</th>
            </tr>
          </thead>
          <tbody>
            ${processedRows.map(row => `
              <tr>
                <td class="title-cell">${cleanExportText(row.title)}</td>
                <td>${cleanExportText(formatAuthors(row.authors))}</td>
                <td>${cleanExportText(
                    `${row.conference_journal_name || ""} ${row.publication_year || ""}`
                )}</td>
                <td>${cleanExportText(row.datasets)}</td>
                <td>${cleanExportText(row.methods)}</td>
                <td>${cleanExportText(row.results)}</td>
                <td>${cleanExportText(row.gaps)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl font-semibold text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <TableIcon className="w-3.5 h-3.5" />
            <span>Comparative Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Comparison Table
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured 7-column comparative analysis of indexed research papers.
          </p>
        </div>

        {/* Action Controls: Refresh & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchTableData(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Refresh Table Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-500' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            disabled={loading || !((data?.data || data)?.rows?.length)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={loading || !((data?.data || data)?.rows?.length)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={loading || !((data?.data || data)?.rows?.length)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter title, authors, venue, methods..."
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Page Size & Sorting Status */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
          </div>

          <span className="font-medium">
            {searchTerm ? 'Matching: ' : 'Total: '}
            <strong className="text-slate-900 dark:text-white font-bold">{processedRows.length}</strong>
            {searchTerm && (
              <span className="text-slate-400 ml-1">
                (of {((data?.data || data)?.rows?.length || 0)})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main Table Content View */}
      {loading ? (
        // Loading Skeleton State
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generating comparison table...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Extracting datasets, research methods, key results, and limitations across papers.
            </p>
          </div>

          {/* Skeleton Table Placeholder */}
          <div className="space-y-3 pt-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
            ))}
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="p-12 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Unable to load comparison table.
            </h3>
            <p className="text-xs text-slate-500">
              Please try again.
            </p>
          </div>
          <button
            onClick={() => fetchTableData(true)}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-soft transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : !((data?.data || data)?.rows?.length) ? (
        // Empty State
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No comparison data available.
            </h3>
            <p className="text-xs text-slate-500">
              Upload research papers first.
            </p>
          </div>
        </div>
      ) : (
        // Excel/Google Sheets Style Professional Table
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              {/* Sticky Header */}
              <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/95 border-b-2 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <tr className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider divide-x divide-slate-200 dark:divide-slate-700">
                  {/* Column 1: Title (Sortable) */}
                  <th className="py-3.5 px-4 min-w-[220px] max-w-[280px]">
                    <button
                      onClick={() => handleSort('title')}
                      className="w-full flex items-center justify-between font-bold hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      <span>Title</span>
                      {sortField === 'title' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  {/* Column 2: Authors */}
                  <th className="py-3.5 px-4 min-w-[180px] max-w-[220px]">
                    <span>Authors</span>
                  </th>

                  {/* Column 3: Conference/Journal & Year (Sortable by Venue & Year) */}
                  <th className="py-3.5 px-4 min-w-[180px] max-w-[220px]">
                    <div className="flex items-center justify-between space-x-1">
                      <span>Conference / Journal & Year</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSort('venue')}
                          title="Sort by Venue Name"
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${sortField === 'venue' ? 'text-brand-500 font-black' : 'text-slate-400'}`}
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSort('year')}
                          title="Sort by Publication Year"
                          className={`px-1 py-0.5 text-[9px] rounded font-bold border ${sortField === 'year' ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-600 text-slate-500'}`}
                        >
                          Yr
                        </button>
                      </div>
                    </div>
                  </th>

                  {/* Column 4: Datasets */}
                  <th className="py-3.5 px-4 min-w-[220px] max-w-[320px]">
                    <span>Datasets</span>
                  </th>

                  {/* Column 5: Research Methods */}
                  <th className="py-3.5 px-4 min-w-[220px] max-w-[320px]">
                    <span>Research Methods</span>
                  </th>

                  {/* Column 6: Results / Findings */}
                  <th className="py-3.5 px-4 min-w-[240px] max-w-[360px]">
                    <span>Results / Findings</span>
                  </th>

                  {/* Column 7: Research Gaps / Limitations */}
                  <th className="py-3.5 px-4 min-w-[240px] max-w-[360px]">
                    <span>Research Gaps / Limitations</span>
                  </th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                      <div className="space-y-2">
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          {searchTerm ? `No matching papers found for "${searchTerm}"` : 'No papers available.'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition-colors"
                          >
                            Clear search filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row, idx) => {
                  const rowId = row.paper_id || idx;
                  const formattedAuthors = formatAuthors(row.authors);

                  return (
                    <tr
                      key={rowId}
                      className="odd:bg-white even:bg-slate-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors divide-x divide-slate-200 dark:divide-slate-800 group"
                    >
                      {/* Cell 1: Title (Bold, Wrapped) */}
                      <td className="p-4 align-top min-w-[220px] max-w-[280px] relative">
                        <div className="font-bold text-slate-900 dark:text-slate-100 whitespace-normal break-words leading-snug pr-6">
                          {row.title || 'Untitled Paper'}
                        </div>
                        <button
                          onClick={() => handleCopyCell(row.title, `title-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy title"
                        >
                          {copiedCellId === `title-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 2: Authors */}
                      <td className="p-4 align-top min-w-[180px] max-w-[220px] relative">
                        <div className="text-slate-700 dark:text-slate-300 font-medium whitespace-normal break-words leading-relaxed pr-6">
                          {formattedAuthors}
                        </div>
                        <button
                          onClick={() => handleCopyCell(formattedAuthors, `authors-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy authors"
                        >
                          {copiedCellId === `authors-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 3: Venue & Year */}
                      <td className="p-4 align-top min-w-[180px] max-w-[220px] relative">
                        <div className="text-slate-600 dark:text-slate-400 font-medium whitespace-normal break-words pr-6">
                          <>
  {row.conference_journal_name || "Not specified"}
  {row.publication_year && (
    <>
      <br />
      <span className="text-xs text-slate-500">
        {row.publication_year}
      </span>
    </>
  )}
</>
                        </div>
                        <button
                          onClick={() =>
                            handleCopyCell(
                                `${row.conference_journal_name || ""} ${row.publication_year || ""}`,
                                `venue-${rowId}`
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy venue & year"
                        >
                          {copiedCellId === `venue-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 4: Datasets (Auto Wrap, Never Truncate) */}
                      <td className="p-4 align-top min-w-[220px] max-w-[320px] relative">
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words pr-6">
                          {row.datasets || 'Not specified'}
                        </div>
                        <button
                          onClick={() => handleCopyCell(row.datasets, `datasets-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy datasets"
                        >
                          {copiedCellId === `datasets-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 5: Research Methods (Auto Wrap, Never Truncate) */}
                      <td className="p-4 align-top min-w-[220px] max-w-[320px] relative">
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words pr-6">
                          {row.methods || 'Not specified'}
                        </div>
                        <button
                          onClick={() => handleCopyCell(row.methods, `methods-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy research methods"
                        >
                          {copiedCellId === `methods-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 6: Results / Findings (Auto Wrap, Never Truncate) */}
                      <td className="p-4 align-top min-w-[240px] max-w-[360px] relative">
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words pr-6">
                          {row.results || 'Not specified'}
                        </div>
                        <button
                          onClick={() => handleCopyCell(row.results, `results-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy results"
                        >
                          {copiedCellId === `results-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Cell 7: Research Gaps / Limitations (Auto Wrap, Never Truncate) */}
                      <td className="p-4 align-top min-w-[240px] max-w-[360px] relative">
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words pr-6">
                          {row.gaps || 'Not specified'}
                        </div>
                        <button
                          onClick={() => handleCopyCell(row.gaps, `gaps-${rowId}`)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm"
                          title="Copy gaps & limitations"
                        >
                          {copiedCellId === `gaps-${rowId}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination Controls */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Showing <strong className="text-slate-900 dark:text-white font-bold">{Math.min((currentPageSafe - 1) * pageSize + 1, totalItems)}</strong> to <strong className="text-slate-900 dark:text-white font-bold">{Math.min(currentPageSafe * pageSize, totalItems)}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{totalItems}</strong> entries
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPageSafe === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <span className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200">
                  Page {currentPageSafe} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPageSafe === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
