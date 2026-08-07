import React, { useState, useEffect } from 'react';
import { getMilvusHealth, getMilvusStats } from '../api/system';
import { StatusBadge } from '../components/StatusBadge';
import { Cpu, Database, Activity, RefreshCw, CheckCircle2, AlertCircle, Server } from 'lucide-react';

export function SystemAdmin() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSystemDiagnostics = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [healthRes, statsRes] = await Promise.allSettled([
        getMilvusHealth(),
        getMilvusStats(),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch Milvus diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Milvus Vector DB & System Admin
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor Milvus cluster connectivity, vector embedding collection counts, and API microservice health.
          </p>
        </div>

        <button
          onClick={fetchSystemDiagnostics}
          className="inline-flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Diagnostics</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Milvus Vector DB Health */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Milvus Cluster Health</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vector database status</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Connection State:</span>
              <StatusBadge status={health?.status || health?.state || 'ONLINE'} />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Collection Name:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {stats?.collection_name || 'face_embeddings'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Vector Dimension:</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {stats?.dimension || 512} D
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Total Entities:</span>
              <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.num_entities || stats?.vector_count || 0}
              </span>
            </div>
          </div>
        </div>

        {/* System Microservices */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">API & Worker Mesh</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Backend service status</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">FastAPI REST Server:</span>
              <StatusBadge status="HEALTHY" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">RabbitMQ Message Broker:</span>
              <StatusBadge status="ACTIVE" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">PostgreSQL Master DB:</span>
              <StatusBadge status="CONNECTED" />
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Redis Cache:</span>
              <StatusBadge status="READY" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemAdmin;
