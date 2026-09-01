import React from 'react';
import {
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  Zap,
  Activity,
  Server,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function RecognitionSystemHealthCard({
  milvusHealthy = true,
  vectorCount = 0,
  accuracy = 98.2,
  successRate = 99.1,
}) {
  const systemNodes = [
    {
      name: 'InsightFace Core',
      role: 'Feature Extraction',
      status: 'buffalo_l Loaded',
      latency: '< 18ms',
      icon: Cpu,
      isHealthy: true,
      color: 'indigo',
    },
    {
      name: 'Milvus Vector DB',
      role: 'Vector Search Cluster',
      status: milvusHealthy ? 'Cluster Nominal' : 'Connecting...',
      latency: milvusHealthy ? '< 6ms' : 'N/A',
      icon: Database,
      isHealthy: milvusHealthy,
      color: milvusHealthy ? 'emerald' : 'amber',
    },
    {
      name: 'Indexed Gallery',
      role: 'Registered Biometrics',
      status: `${vectorCount.toLocaleString()} Vectors`,
      latency: '512-Dim L2',
      icon: Layers,
      isHealthy: true,
      color: 'blue',
    },
    {
      name: 'Cosine Matcher',
      role: 'Threshold Validator',
      status: 'HNSW Index Active',
      latency: 'ef=64, M=16',
      icon: Zap,
      isHealthy: true,
      color: 'purple',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with Live Status Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Recognition System & AI Nodes
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inference pipeline, vector cluster health, and cosine telemetry
          </p>
        </div>

        {/* Global Cluster Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs',
              milvusHealthy
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
                : 'text-amber-700 bg-amber-50 border-amber-200/80'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                milvusHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )}
            />
            {milvusHealthy ? 'All AI Nodes Online' : 'Cluster Initializing'}
          </span>
        </div>
      </div>

      {/* 2. AI Service Nodes (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {systemNodes.map((node, idx) => {
          const Icon = node.icon;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-start gap-3 shadow-2xs group"
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105',
                  node.color === 'indigo' && 'bg-indigo-50 text-indigo-600 border-indigo-100',
                  node.color === 'emerald' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  node.color === 'blue' && 'bg-blue-50 text-blue-600 border-blue-100',
                  node.color === 'purple' && 'bg-purple-50 text-purple-600 border-purple-100',
                  node.color === 'amber' && 'bg-amber-50 text-amber-600 border-amber-100'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {node.name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 shadow-2xs shrink-0">
                    {node.latency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mt-1">
                  <span className="truncate">{node.role}</span>
                  <span
                    className={cn(
                      'text-[10px] font-bold font-mono shrink-0 ml-1',
                      node.isHealthy ? 'text-emerald-600' : 'text-amber-600'
                    )}
                  >
                    {node.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Real-time Telemetry Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Metric 1: Cosine Accuracy */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-indigo-50/20 border border-indigo-100/90 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Cosine Accuracy
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-slate-900">
                {accuracy}%
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 font-mono">
                (L2 Normalized)
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200/80 flex flex-col items-center justify-center shadow-2xs">
            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-[9px] font-bold text-indigo-600 mt-0.5">99.1%</span>
          </div>
        </div>

        {/* Metric 2: Vector Indexing */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 border border-emerald-100/90 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Vector Index Algorithm
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-slate-900">
                HNSW
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                (Sub-10ms)
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/80 flex flex-col items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-bold text-emerald-700 mt-0.5">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecognitionSystemHealthCard;
