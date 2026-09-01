import React, { useState } from 'react';
import { ScanFace, CheckCircle2, Clock, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function FaceEnrollmentOverviewDonut({
  enrolled = 0,
  pending = 0,
  failed = 0,
  notStarted = 0,
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const total = enrolled + pending + failed + notStarted;
  const enrolledPct = total > 0 ? ((enrolled / total) * 100).toFixed(1) : '0.0';

  const segments = [
    {
      id: 'enrolled',
      label: 'Face Enrolled',
      count: enrolled,
      color: '#6366f1',
      gradientId: 'enrolledDonutGrad',
      bgClass: 'bg-indigo-50/70 border-indigo-200/80 text-indigo-700',
      dotClass: 'bg-indigo-600',
      iconClass: 'text-indigo-600 bg-indigo-100/80',
      icon: CheckCircle2,
      pct: total > 0 ? ((enrolled / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'pending',
      label: 'Pending In Flight',
      count: pending,
      color: '#f59e0b',
      gradientId: 'pendingDonutGrad',
      bgClass: 'bg-amber-50/70 border-amber-200/80 text-amber-700',
      dotClass: 'bg-amber-500',
      iconClass: 'text-amber-600 bg-amber-100/80',
      icon: Clock,
      pct: total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'failed',
      label: 'Failed / Error',
      count: failed,
      color: '#f43f5e',
      gradientId: 'failedDonutGrad',
      bgClass: 'bg-rose-50/70 border-rose-200/80 text-rose-700',
      dotClass: 'bg-rose-500',
      iconClass: 'text-rose-600 bg-rose-100/80',
      icon: AlertTriangle,
      pct: total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'not-started',
      label: 'Not Started',
      count: notStarted,
      color: '#94a3b8',
      gradientId: 'notStartedDonutGrad',
      bgClass: 'bg-slate-50/80 border-slate-200/80 text-slate-700',
      dotClass: 'bg-slate-400',
      iconClass: 'text-slate-500 bg-slate-200/70',
      icon: HelpCircle,
      pct: total > 0 ? ((notStarted / total) * 100).toFixed(1) : '0.0',
    },
  ];

  // SVG Donut Math
  const size = 190;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Face Enrollment Overview</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric status breakdown across workforce
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            Total: {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Donut Graphic with Glowing Ambient Ring & Central Typography */}
      <div className="flex flex-col items-center justify-center py-1 relative my-auto">
        <div className="relative w-[190px] h-[190px] flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-4 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="enrolledDonutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="pendingDonutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="failedDonutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="notStartedDonutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>

            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segment arcs */}
            {total > 0 &&
              segments.map((seg) => {
                const segPct = seg.count / total;
                if (segPct === 0) return null;

                const strokeDasharray = `${segPct * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += segPct;

                const isHovered = hoveredSlice === seg.id;

                return (
                  <circle
                    key={seg.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={`url(#${seg.gradientId})`}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSlice(seg.id)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className="transition-all duration-300 cursor-pointer"
                  />
                );
              })}
          </svg>

          {/* Center Text Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">
              {enrolledPct}%
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
              Enrollment Rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Mini Distribution Bar */}
      {total > 0 && (
        <div className="w-full bg-slate-100/90 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/70 flex gap-0.5">
          {segments.map((seg) => {
            const pct = (seg.count / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={seg.id}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="h-full rounded-full transition-all duration-500"
                title={`${seg.label}: ${seg.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      )}

      {/* 4. Detailed 2x2 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        {segments.map((seg) => {
          const Icon = seg.icon;
          const isHovered = hoveredSlice === seg.id;

          return (
            <div
              key={seg.id}
              onMouseEnter={() => setHoveredSlice(seg.id)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={cn(
                'p-3 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border space-y-2',
                isHovered
                  ? 'bg-slate-50/90 border-indigo-300 shadow-sm scale-[1.02]'
                  : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', seg.dotClass)} />
                  <span className="text-xs font-semibold text-slate-700 truncate">{seg.label}</span>
                </div>
                <div className={cn('p-1 rounded-lg shrink-0', seg.iconClass)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-base font-extrabold font-mono text-slate-900 tracking-tight">
                  {seg.count.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold font-mono text-slate-500 px-1.5 py-0.5 rounded-md bg-white border border-slate-200/70 shadow-2xs">
                  {seg.pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FaceEnrollmentOverviewDonut;
