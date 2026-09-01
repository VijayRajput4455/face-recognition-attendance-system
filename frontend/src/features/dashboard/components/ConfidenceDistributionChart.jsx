import React, { useState } from 'react';
import {
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ConfidenceDistributionChart({ avgConfidence = 96.8, totalScans = 18 }) {
  const [hoveredTier, setHoveredTier] = useState(null);

  const tiers = [
    {
      id: 'tier-ultra',
      label: 'Ultra High Precision',
      range: '0.95 - 1.00',
      count: Math.max(1, Math.round(totalScans * 0.72)),
      pct: 72,
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-400',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      securityStatus: 'Definite Match • Instant Pass',
    },
    {
      id: 'tier-high',
      label: 'High Confidence',
      range: '0.85 - 0.94',
      count: Math.max(1, Math.round(totalScans * 0.20)),
      pct: 20,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-blue-400',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      securityStatus: 'Strong Match • Standard Verify',
    },
    {
      id: 'tier-standard',
      label: 'Standard Threshold',
      range: '0.60 - 0.84',
      count: Math.max(0, Math.round(totalScans * 0.06)),
      pct: 6,
      color: 'bg-amber-400',
      gradient: 'from-amber-400 to-orange-400',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      securityStatus: 'Borderline Match • Light Check',
    },
    {
      id: 'tier-rejected',
      label: 'Unmatched / Unknown',
      range: '< 0.60',
      count: Math.max(0, Math.round(totalScans * 0.02)),
      pct: 2,
      color: 'bg-rose-500',
      gradient: 'from-rose-500 to-pink-400',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      securityStatus: 'Rejected • Access Denied',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cosine Similarity Score Spectrum</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical distribution of facial vector distances across recognition operations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {avgConfidence}% Avg Confidence
          </span>
        </div>
      </div>

      {/* 2. Multi-Segment Interactive Spectrum Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Similarity Density Spectrum
          </span>
          <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Optimal Pass Band &ge; 0.60
          </span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-200/80 shadow-inner">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              style={{ width: `${tier.pct}%` }}
              className={cn(
                'h-full rounded-full transition-all duration-300 cursor-pointer bg-gradient-to-r shadow-2xs',
                tier.gradient,
                hoveredTier === tier.id && 'ring-2 ring-indigo-600 scale-y-125 shadow-md'
              )}
              title={`${tier.label} (${tier.range}): ${tier.pct}%`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 font-semibold">
          <span>0.00 (Reject)</span>
          <span className="text-amber-600">0.60 (Threshold)</span>
          <span className="text-indigo-600">0.85 (High)</span>
          <span className="text-emerald-600">1.00 (Match)</span>
        </div>
      </div>

      {/* 3. Interactive Tier Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiers.map((tier) => {
          const isHovered = hoveredTier === tier.id;

          return (
            <div
              key={tier.id}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={cn(
                'p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2 cursor-pointer shadow-2xs',
                isHovered
                  ? 'border-indigo-300 bg-indigo-50/40 shadow-sm scale-[1.01]'
                  : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', tier.color)} />
                  <span className="text-xs font-bold text-slate-800 truncate">{tier.label}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold font-mono px-2 py-0.5 rounded-md border shadow-2xs shrink-0',
                    tier.bgColor,
                    tier.textColor,
                    tier.borderColor
                  )}
                >
                  {tier.pct}%
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-200/50">
                <span className="font-extrabold font-mono text-slate-900">{tier.range}</span>
                <span className="text-[10px] font-medium text-slate-500 truncate max-w-[170px]">
                  {tier.securityStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConfidenceDistributionChart;
