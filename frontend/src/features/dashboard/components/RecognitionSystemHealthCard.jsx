import React from 'react';
import { ShieldCheck, Database, Camera, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function RecognitionSystemHealthCard({
  milvusHealthy = true,
  vectorCount = 0,
  accuracy = 98.2,
  successRate = 99.1,
}) {
  const systemServices = [
    { name: 'Recognition Engine', status: 'Online', icon: Cpu, isHealthy: true },
    { name: 'Database (Milvus)', status: milvusHealthy ? 'Healthy' : 'Degraded', icon: Database, isHealthy: milvusHealthy },
    { name: 'Face Model', status: 'buffalo_l Loaded', icon: ShieldCheck, isHealthy: true },
    { name: 'Indexed Gallery', status: `${vectorCount} Vectors`, icon: Database, isHealthy: true },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Recognition System Health & AI Nodes</h3>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border',
            milvusHealthy
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-amber-700 bg-amber-50 border-amber-200'
          )}
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              milvusHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            )}
          />
          {milvusHealthy ? 'All AI Nodes Nominal' : 'Cluster Initializing'}
        </span>
      </div>

      {/* 4 Core Services Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {systemServices.map((svc, idx) => {
          const Icon = svc.icon;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{svc.name}</span>
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    svc.isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{svc.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accuracy & Success KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-indigo-900/70 uppercase tracking-wider block">
              Cosine Metric Accuracy
            </span>
            <span className="text-2xl font-black text-indigo-950 font-mono">{accuracy}%</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            L2 Normalized
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-emerald-900/70 uppercase tracking-wider block">
              Vector Index Algorithm
            </span>
            <span className="text-2xl font-black text-emerald-950 font-mono">HNSW</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            M=16, ef=64
          </span>
        </div>
      </div>
    </div>
  );
}

export default RecognitionSystemHealthCard;
