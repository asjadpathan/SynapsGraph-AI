import React, { useState, useEffect } from 'react';
import { Database, Server, Cpu, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AnalyticsView() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/health')
      .then(res => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Health check error:", err);
        setLoading(false);
      });
  }, []);

  const dbs = [
    { name: "PostgreSQL Database", key: "postgres", desc: "Metadata & Paper Records", icon: Database },
    { name: "Neo4j Graph Database", key: "neo4j", desc: "Cypher Nodes & Relationships", icon: Server },
    { name: "Qdrant Vector DB", key: "qdrant", desc: "384-d Cosine Vectors", icon: Cpu },
    { name: "Redis Cache Store", key: "redis", desc: "Session & Fast Index Cache", icon: HardDrive }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System & Data Analytics</h1>
        <p className="text-xs text-slate-500">Live health check directly from backend GET /health.</p>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dbs.map((db, idx) => {
          const Icon = db.icon;
          const statusVal = health ? health[db.key] : (loading ? 'checking...' : 'unavailable');
          const isConnected = statusVal === 'connected';

          return (
            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-500 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{db.name}</h3>
                <p className="text-[11px] text-slate-500">{db.desc}</p>
              </div>
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {isConnected ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="capitalize">{statusVal}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
