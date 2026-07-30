import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  X, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileCheck,
  Brain
} from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function PdfUploadPage({ onUploadFinished }) {
  const { activeWorkspace } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (incomingFiles) => {
    const validPdfs = Array.from(incomingFiles).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    const newItems = validPdfs.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      progress: 0,
      status: 'idle', // 'idle', 'uploading', 'success', 'error'
      errorMsg: ''
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id) => {
    setFiles(prev => prev.filter(item => item.id !== id));
  };

  const uploadItem = async (item) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading', progress: 30 } : f));
    try {
      // Simulate progressive upload
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === item.id && f.progress < 90) {
            return { ...f, progress: f.progress + 20 };
          }
          return f;
        }));
      }, 200);

      const res = await PaperService.uploadPaper(activeWorkspace?.project_id || 1, item.file);
      clearInterval(interval);

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'success', progress: 100 } : f));
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMsg: err.message } : f));
    }
  };

  const handleUploadAll = async () => {
    const pending = files.filter(f => f.status === 'idle' || f.status === 'error');
    for (const item of pending) {
      await uploadItem(item);
    }
    setTimeout(() => {
      onUploadFinished(files);
    }, 600);
  };

  const hasSuccessfulUploads = files.some(f => f.status === 'success');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
          <UploadCloud className="w-4 h-4" />
          <span>Paper Ingestion Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Upload Research Papers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload PDF documents into workspace <span className="font-bold text-brand-500">"{activeWorkspace?.name || 'Default Project'}"</span> for GROBID parsing and graph index build.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-850'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-soft">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Drag & drop PDF research papers here
          </h3>
          <p className="text-xs text-slate-400 mt-1">Supports single or batch upload (PDF only, max 50MB per file)</p>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
        >
          Browse Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-500" />
              <span>Selected Files ({files.length})</span>
            </h4>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-slate-400 hover:text-rose-500 font-semibold"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1 max-w-md">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.size}</p>
                  </div>
                </div>

                {/* Progress / Status */}
                <div className="flex items-center space-x-4">
                  {item.status === 'uploading' && (
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>Uploading...</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {item.status === 'success' && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Uploaded
                    </span>
                  )}

                  {item.status === 'error' && (
                    <button
                      onClick={() => uploadItem(item)}
                      className="flex items-center text-xs font-bold text-amber-600 gap-1 bg-amber-50 px-2.5 py-1 rounded-lg"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUploadAll}
              className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center space-x-2"
            >
              <span>Process Files & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
