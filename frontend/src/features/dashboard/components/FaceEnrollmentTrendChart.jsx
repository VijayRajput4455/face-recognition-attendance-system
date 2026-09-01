import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, ScanFace, Clock, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function FaceEnrollmentTrendChart({
  timeframe = 'monthly',
  setTimeframe,
  points = [],
  loading = false,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartPoints = points.length > 0 ? points : [
    { label: 'Jan', date: 'January', total_employees: 1, face_enrolled: 0, pending: 1 },
    { label: 'Feb', date: 'February', total_employees: 1, face_enrolled: 0, pending: 1 },
    { label: 'Mar', date: 'March', total_employees: 1, face_enrolled: 0, pending: 1 },
    { label: 'Apr', date: 'April', total_employees: 1, face_enrolled: 0, pending: 1 },
    { label: 'May', date: 'May', total_employees: 1, face_enrolled: 0, pending: 1 },
    { label: 'Jun', date: 'June', total_employees: 1, face_enrolled: 0, pending: 1 },
  ];

  const maxVal = Math.max(...chartPoints.map((p) => Math.max(p.total_employees, p.face_enrolled, p.pending)), 5);

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const getCoordinates = (val, idx) => {
    const x = paddingLeft + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth;
    const y = svgHeight - paddingBottom - (val / (maxVal || 1)) * graphHeight;
    return { x, y };
  };

  // Generate Smooth Bezier Curves
  const generateSmoothPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const totalPoints = chartPoints.map((p, idx) => getCoordinates(p.total_employees, idx));
  const enrolledPoints = chartPoints.map((p, idx) => getCoordinates(p.face_enrolled, idx));
  const pendingPoints = chartPoints.map((p, idx) => getCoordinates(p.pending, idx));

  const totalSmoothPath = generateSmoothPath(totalPoints);
  const enrolledSmoothPath = generateSmoothPath(enrolledPoints);
  const pendingSmoothPath = generateSmoothPath(pendingPoints);

  // Enrolled Area Fill
  const firstPt = enrolledPoints[0] || { x: paddingLeft, y: svgHeight - paddingBottom };
  const lastPt = enrolledPoints[enrolledPoints.length - 1] || { x: svgWidth - paddingRight, y: svgHeight - paddingBottom };
  const enrolledArea = `${enrolledSmoothPath} L ${lastPt.x} ${svgHeight - paddingBottom} L ${firstPt.x} ${svgHeight - paddingBottom} Z`;

  // Latest summary counts
  const latest = chartPoints[chartPoints.length - 1] || { total_employees: 0, face_enrolled: 0, pending: 0 };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with Title & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Face Enrollment Trend</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time enrollment trajectory vs workforce growth
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs self-start sm:self-auto shrink-0">
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe?.(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer',
                timeframe === t
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive KPI Legend Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Total */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="p-1.5 rounded-xl bg-slate-900 text-white shadow-2xs">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Workforce
            </span>
            <span className="text-sm font-extrabold font-mono text-slate-900 leading-tight block">
              {latest.total_employees.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 2: Enrolled */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70">
          <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
            <ScanFace className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block truncate">
              Enrolled
            </span>
            <span className="text-sm font-extrabold font-mono text-indigo-700 leading-tight block">
              {latest.face_enrolled.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 3: Pending */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
          <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block truncate">
              Pending
            </span>
            <span className="text-sm font-extrabold font-mono text-amber-700 leading-tight block">
              {latest.pending.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Responsive SVG Chart Area */}
      <div className="relative pt-1 flex-1 flex flex-col justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="trendEnrolledGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = svgHeight - paddingBottom - ratio * graphHeight;
            const val = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={enrolledArea} fill="url(#trendEnrolledGradient)" />

          {/* Smooth Trajectory Curves */}
          <path
            d={totalSmoothPath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={enrolledSmoothPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={pendingSmoothPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Interactive Data Points & Hover Columns */}
          {chartPoints.map((p, idx) => {
            const totalPt = totalPoints[idx] || { x: 0, y: 0 };
            const enrolledPt = enrolledPoints[idx] || { x: 0, y: 0 };
            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <g>
                    <line
                      x1={enrolledPt.x}
                      y1={paddingTop}
                      x2={enrolledPt.x}
                      y2={svgHeight - paddingBottom}
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={enrolledPt.x}
                      cy={enrolledPt.y}
                      r="10"
                      fill="#6366f1"
                      fillOpacity="0.2"
                    />
                  </g>
                )}

                {/* X Axis Label */}
                <text
                  x={enrolledPt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? '#4f46e5' : '#64748b'}
                >
                  {p.label}
                </text>

                {/* Enrolled Point Marker */}
                <circle
                  cx={enrolledPt.x}
                  cy={enrolledPt.y}
                  r={isHovered ? 6 : 4}
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Total Point Marker */}
                <circle
                  cx={totalPt.x}
                  cy={totalPt.y}
                  r={isHovered ? 5 : 3}
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredIdx !== null && chartPoints[hoveredIdx] && (
          <div
            className="absolute top-0 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-2xl shadow-xl pointer-events-none z-10 space-y-2 border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${(getCoordinates(chartPoints[hoveredIdx].face_enrolled, hoveredIdx).x / svgWidth) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300 font-mono border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white">{chartPoints[hoveredIdx].date}</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                Live Data
              </span>
            </div>
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Workforce:
                </span>
                <span className="font-bold text-white font-mono">{chartPoints[hoveredIdx].total_employees}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Face Enrolled:
                </span>
                <span className="font-bold text-indigo-300 font-mono">{chartPoints[hoveredIdx].face_enrolled}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Pending:
                </span>
                <span className="font-bold text-amber-300 font-mono">{chartPoints[hoveredIdx].pending}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FaceEnrollmentTrendChart;
