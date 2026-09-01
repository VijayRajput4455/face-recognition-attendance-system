import React, { useState } from 'react';
import { ScanFace, CheckCircle2, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
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
      bgClass: 'bg-indigo-500',
      textClass: 'text-indigo-600',
      icon: CheckCircle2,
      pct: total > 0 ? ((enrolled / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'pending',
      label: 'Pending In Flight',
      count: pending,
      color: '#f59e0b',
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-600',
      icon: Clock,
      pct: total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'failed',
      label: 'Failed / Error',
      count: failed,
      color: '#f43f5e',
      bgClass: 'bg-rose-500',
      textClass: 'text-rose-600',
      icon: AlertTriangle,
      pct: total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0',
    },
    {
      id: 'not-started',
      label: 'Not Started',
      count: notStarted,
      color: '#cbd5e1',
      bgClass: 'bg-slate-300',
      textClass: 'text-slate-500',
      icon: HelpCircle,
      pct: total > 0 ? ((notStarted / total) * 100).toFixed(1) : '0.0',
    },
  ];

  // SVG Donut Math
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Face Enrollment Overview</h3>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500">
          Total: {total.toLocaleString()}
        </span>
      </div>

      {/* Donut Graphic with Center Stat */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="relative w-[180px] h-[180px]">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
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
                    stroke={seg.color}
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

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 leading-none">
              {enrolledPct}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Enrollment Complete
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Legend */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onMouseEnter={() => setHoveredSlice(seg.id)}
            onMouseLeave={() => setHoveredSlice(null)}
            className={cn(
              'p-2.5 rounded-xl transition-all cursor-pointer flex flex-col justify-between border',
              hoveredSlice === seg.id
                ? 'bg-slate-50 border-slate-200 shadow-2xs'
                : 'border-transparent hover:bg-slate-50/60'
            )}
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className={cn('w-2 h-2 rounded-full shrink-0', seg.bgClass)} />
              <span className="truncate">{seg.label}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold font-mono text-slate-900">
                {seg.count.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{seg.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaceEnrollmentOverviewDonut;
