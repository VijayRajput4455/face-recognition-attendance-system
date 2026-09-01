import React from 'react';
import {
  Database,
  Cpu,
  Zap,
  Server,
  Search,
  Activity,
  Network,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Share2,
} from 'lucide-react';
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
      border: 'border-indigo-100',
    },
    {
      label: 'Index Topology',
      value: indexType,
      sub: 'M=16, efConstruct=200',
      icon: Network,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Distance Metric',
      value: metricType,
      sub: 'Normalized Dot Product',
      icon: Search,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'ANN Query Latency',
      value: '< 4.2 ms',
      sub: 'Top-1 Instant Retrieval',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Milvus Vector Database Topology</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              High-throughput vector indexing and ANN similarity search metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs',
              isConnected
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
                : 'text-rose-700 bg-rose-50 border-rose-200/80'
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

      {/* 2. Vector Collection Hero Visualizer */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
          <Share2 className="w-56 h-56 text-indigo-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
          {/* Ingestion Density */}
          <div className="md:col-span-7 space-y-2">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Active Collection: employee_face_embeddings
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {totalVectors.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vectors Ingested
              </span>
            </div>
            <p className="text-xs text-slate-300/80 max-w-md leading-relaxed pt-1">
              512-dimensional Euclidean face vectors partitioned via HNSW proximity graphs for sub-millisecond retrieval.
            </p>
          </div>

          {/* Cluster Telemetry Node Card */}
          <div className="md:col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                Cluster Telemetry
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                100% Synced
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Search ef:</span>
                <span className="font-bold text-white">64 (Fast)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Segment Size:</span>
                <span className="font-bold text-emerald-400">512 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">L2 Normalized:</span>
                <span className="font-bold text-sky-400">||v|| = 1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stats Quad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={cn(
                'p-3.5 rounded-2xl border bg-slate-50/40 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-2 shadow-2xs',
                item.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {item.label}
                </span>
                <div className={cn('p-1.5 rounded-lg shadow-2xs', item.bg, item.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 block">
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {item.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MilvusVectorDistributionChart;
