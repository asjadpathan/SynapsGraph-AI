import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  User, 
  FileText, 
  X, 
  BookOpen
} from 'lucide-react';
import { PaperService } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function KnowledgeGraphView() {
  const { activeWorkspace } = useWorkspace();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace?.project_id) {
      setLoading(true);
      Promise.all([
        PaperService.getPapers(activeWorkspace.project_id),
        PaperService.getAuthorNetwork(activeWorkspace.project_id)
      ]).then(([papersRes, networkRes]) => {
        const generatedNodes = [];
        const generatedEdges = [];
        const authorSet = new Set();

        const paperList = papersRes || [];
        const topAuthors = networkRes?.top_authors || [];

        // Add Paper Nodes
        paperList.forEach((p, idx) => {
          const px = 200 + (idx % 4) * 180;
          const py = 120 + Math.floor(idx / 4) * 160;

          generatedNodes.push({
            id: `paper-${p.id}`,
            label: p.title || p.filename,
            type: 'paper',
            x: px,
            y: py,
            paperData: p
          });

          // Process authors
          const authors = Array.isArray(p.authors) ? p.authors : (p.authors ? [p.authors] : []);
          authors.forEach((aName, aIdx) => {
            const authorId = `author-${aName.replace(/\s+/g, '_')}`;
            if (!authorSet.has(authorId)) {
              authorSet.add(authorId);
              generatedNodes.push({
                id: authorId,
                label: aName,
                type: 'author',
                x: px + (aIdx % 2 === 0 ? -90 : 90),
                y: py + (aIdx > 1 ? 90 : -90),
                authorName: aName
              });
            }

            generatedEdges.push({
              from: authorId,
              to: `paper-${p.id}`,
              label: 'AUTHORED'
            });
          });
        });

        setNodes(generatedNodes);
        setEdges(generatedEdges);
        setLoading(false);
      }).catch(err => {
        console.error("Knowledge graph fetch error:", err);
        setLoading(false);
      });
    }
  }, [activeWorkspace]);

  const filteredNodes = nodes.filter(n =>
    n.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Neo4j Interactive Knowledge Graph</h2>
            <p className="text-[10px] text-slate-400">Live nodes and authorship links from GET /author-network.</p>
          </div>
        </div>

        {/* Search Nodes & Zoom */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-brand-500 w-44"
            />
          </div>

          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300"
            >
              100%
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 flex">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Loading Knowledge Graph from Neo4j...
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            No graph nodes available in this workspace yet. Upload PDF papers to populate Neo4j.
          </div>
        ) : (
          <div className="flex-1 relative overflow-auto p-12">
            <svg
              className="w-full h-full min-w-[800px] min-h-[600px]"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out' }}
            >
              {/* Edges */}
              {edges.map((e, idx) => {
                const source = nodes.find(n => n.id === e.from);
                const target = nodes.find(n => n.id === e.to);
                if (!source || !target) return null;
                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2}
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {e.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((n) => {
                const isPaper = n.type === 'paper';
                const isSelected = selectedNode?.id === n.id;
                return (
                  <g
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isPaper ? 26 : 20}
                      fill={isPaper ? '#3B82F6' : '#8B5CF6'}
                      stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                      strokeWidth={isSelected ? 4 : 2}
                      className="transition-all hover:scale-110"
                    />
                    <text
                      x={n.x}
                      y={n.y + 36}
                      fill="#F8FAFC"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {n.label.length > 25 ? n.label.substring(0, 22) + '...' : n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Right Side Details Panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-slate-900 border-l border-slate-800 p-6 space-y-6 z-20 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                Backend Node Output
              </span>
              <button onClick={() => setSelectedNode(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${selectedNode.type === 'paper' ? 'bg-brand-500' : 'bg-purple-500'}`}>
                  {selectedNode.type === 'paper' ? <FileText className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-bold text-white truncate">{selectedNode.label}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{selectedNode.type} Node</span>
                </div>
              </div>

              {selectedNode.type === 'paper' && selectedNode.paperData && (
                <>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                    <span className="text-slate-400 block font-medium">Authors</span>
                    <span className="font-bold text-slate-200">
                      {Array.isArray(selectedNode.paperData.authors) ? selectedNode.paperData.authors.join(', ') : selectedNode.paperData.authors}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                    <span className="text-slate-400 block font-medium">Abstract</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed max-h-36 overflow-y-auto">
                      {selectedNode.paperData.abstract || 'No abstract content.'}
                    </p>
                  </div>
                </>
              )}

              {selectedNode.type === 'author' && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                  <span className="text-slate-400 block font-medium">Author Name</span>
                  <span className="font-bold text-purple-400">{selectedNode.authorName}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
