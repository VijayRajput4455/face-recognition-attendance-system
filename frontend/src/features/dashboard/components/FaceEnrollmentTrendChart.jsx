import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function FaceEnrollmentTrendChart({
  timeframe = 'monthly',
  setTimeframe,
  points = [],
  loading = false,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartPoints = points.length > 0 ? points : [
    { label: 'Start', date: 'Initial', total_employees: 0, face_enrolled: 0, pending: 0 },
    { label: 'Current', date: 'Now', total_employees: 0, face_enrolled: 0, pending: 0 },
  ];

  const maxVal = Math.max(...chartPoints.map((p) => p.total_employees), 5);

  // SVG dimensions - expanded width and optimized inner graph padding
  const svgWidth = 900;
  const svgHeight = 240;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const getCoordinates = (val, idx) => {
    const x = paddingLeft + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth;
    const y = svgHeight - paddingBottom - (val / (maxVal || 1)) * graphHeight;
    return { x, y };
  };

  // Build SVG Paths
  const totalPath = chartPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p.total_employees, idx);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const enrolledPath = chartPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p.face_enrolled, idx);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const pendingPath = chartPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p.pending, idx);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Enrolled Area Fill
  const firstPt = getCoordinates(chartPoints[0]?.face_enrolled || 0, 0);
  const lastPt = getCoordinates(chartPoints[chartPoints.length - 1]?.face_enrolled || 0, chartPoints.length - 1);
  const enrolledArea = `${enrolledPath} L ${lastPt.x} ${svgHeight - paddingBottom} L ${firstPt.x} ${svgHeight - paddingBottom} Z`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
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

        {/* Daily / Weekly / Monthly Switcher */}
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

      {/* Legend Indicators */}
      <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-1 rounded-full bg-slate-900" />
          <span>Total Workforce</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600">
          <span className="w-3 h-1 rounded-full bg-indigo-600" />
          <span>Face Enrolled</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600">
          <span className="w-3 h-1 rounded-full bg-amber-500" />
          <span>Pending Enrollment</span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="enrolledGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
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
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={enrolledArea} fill="url(#enrolledGradient)" />

          {/* Lines */}
          <path
            d={totalPath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={enrolledPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={pendingPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {chartPoints.map((p, idx) => {
            const { x, y } = getCoordinates(p.face_enrolled, idx);
            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={svgHeight - paddingBottom}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#4f46e5' : '#64748b'}
                >
                  {p.label}
                </text>

                {/* Circle Hit Target */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredIdx !== null && chartPoints[hoveredIdx] && (
          <div
            className="absolute top-2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold p-3 rounded-2xl shadow-xl pointer-events-none z-10 space-y-1.5 border border-slate-800 backdrop-blur-md"
            style={{
              left: `${(getCoordinates(chartPoints[hoveredIdx].face_enrolled, hoveredIdx).x / svgWidth) * 100}%`,
            }}
          >
            <div className="text-[11px] text-slate-400 font-mono border-b border-slate-800 pb-1">
              {chartPoints[hoveredIdx].date}
            </div>
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Workforce:</span>
                <span className="font-bold text-white font-mono">{chartPoints[hoveredIdx].total_employees}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-indigo-400">Face Enrolled:</span>
                <span className="font-bold text-indigo-300 font-mono">{chartPoints[hoveredIdx].face_enrolled}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-amber-400">Pending:</span>
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
