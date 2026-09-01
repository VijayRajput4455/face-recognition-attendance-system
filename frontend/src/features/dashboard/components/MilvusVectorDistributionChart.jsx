import React from 'react';
import { Database, Cpu, HardDrive, Zap, CheckCircle2, Server, Search, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function MilvusVectorDistributionChart({
  totalVectors = 0,
  dimension = 512,
  metricType = 'COSINE',
  indexType = 'HNSW',
  isConnected = true,
}) {
  const stats = [
    {
      label: 'Vector Dimensions',
      value: `${dimension}-D`,
      sub: 'ArcFace Normalized',
      icon: Cpu,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Index Algorithm',
      value: indexType,
      sub: 'M=16, efConstruct=200',
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Distance Metric',
      value: metricType,
      sub: 'Normalized Dot Product',
      icon: Search,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Avg Query Latency',
      value: '< 4.2 ms',
      sub: 'Top-1 ANN Retrieval',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Milvus Vector Database Topology</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              High-throughput vector indexing and ANN similarity search metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border',
              isConnected
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-rose-700 bg-rose-50 border-rose-200'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              )}
            />
            {isConnected ? 'Cluster Healthy (v2.4.4)' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Vector Count Display + Radial Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Database className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="md:col-span-2 space-y-2 relative z-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Active Collection: employee_face_embeddings
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {totalVectors.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-400">Total Vectors Ingested</span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed pt-1">
            Every enrolled staff member holds dense vector points in a 512-dimensional Euclidean space, mapped with HNSW graph partitions for sub-millisecond retrieval.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2 relative z-10">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Graph Connectivity
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Search ef</span>
            <span className="font-mono font-bold text-white">64 (Fast)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Segment Size</span>
            <span className="font-mono font-bold text-emerald-400">512 MB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">L2 Normalized</span>
            <span className="font-mono font-bold text-sky-400">True (||v|| = 1.0)</span>
          </div>
        </div>
      </div>

      {/* Stats Quad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-2 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
                <div className={cn('p-1.5 rounded-lg', item.bg, item.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 block">{item.value}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MilvusVectorDistributionChart;
