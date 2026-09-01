import React, { useState } from 'react';
import {
  TrendingUp,
  UserPlus,
  UserMinus,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function EmployeeGrowthTrendChart({
  growthData,
  range = '30d',
  setRange,
  loading = false,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [chartMode, setChartMode] = useState('curve'); // 'curve' | 'turnaround'

  const points = growthData?.points && growthData.points.length > 0
    ? growthData.points
    : [
        { label: 'Week 1', date: 'W1', total: 1, added: 1, removed: 0 },
        { label: 'Week 2', date: 'W2', total: 1, added: 0, removed: 0 },
        { label: 'Week 3', date: 'W3', total: 1, added: 0, removed: 0 },
        { label: 'Week 4', date: 'W4', total: 1, added: 0, removed: 0 },
      ];

  const netWorkforce = growthData?.net_workforce ?? (points[points.length - 1]?.total || 0);
  const activeCount = growthData?.active_count ?? netWorkforce;
  const inactiveCount = growthData?.inactive_count ?? 0;

  const totalAdded = points.reduce((acc, p) => acc + (p.added || 0), 0);
  const totalRemoved = points.reduce((acc, p) => acc + (p.removed || 0), 0);
  const maxVal = Math.max(...points.map((p) => Math.max(p.total, p.added || 0, p.removed || 0)), 5);

  // SVG Chart Layout
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const getCoordinates = (val, idx) => {
    const x = paddingLeft + (idx / Math.max(points.length - 1, 1)) * graphWidth;
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

  const totalPoints = points.map((p, idx) => getCoordinates(p.total, idx));
  const smoothTotalPath = generateSmoothPath(totalPoints);

  // Area Fill
  const firstPt = totalPoints[0] || { x: paddingLeft, y: svgHeight - paddingBottom };
  const lastPt = totalPoints[totalPoints.length - 1] || { x: svgWidth - paddingRight, y: svgHeight - paddingBottom };
  const totalArea = `${smoothTotalPath} L ${lastPt.x} ${svgHeight - paddingBottom} L ${firstPt.x} ${svgHeight - paddingBottom} Z`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with Range Switcher & Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Workforce Growth & Turnaround</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered headcount velocity, new onboarding, and turnaround attrition
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('curve')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                chartMode === 'curve'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Trajectory
            </button>
            <button
              type="button"
              onClick={() => setChartMode('turnaround')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                chartMode === 'turnaround'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Net Joiners
            </button>
          </div>

          {/* Range Buttons */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '3m', label: '3M' },
              { id: '6m', label: '6M' },
              { id: '1y', label: '1Y' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRange?.(btn.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  range === btn.id
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Net Workforce */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-2xs shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Net Headcount
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono text-slate-900 leading-none">
              {netWorkforce.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Active Staff */}
        <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shadow-2xs shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block truncate">
              Active Staff
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-700 leading-none">
              {activeCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Joiners */}
        <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shadow-2xs shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block truncate">
              New Joiners
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono text-indigo-700 leading-none flex items-center gap-1">
              +{totalAdded}
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 inline" />
            </span>
          </div>
        </div>

        {/* Inactive / Exits */}
        <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shadow-2xs shrink-0">
            <UserMinus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block truncate">
              Exits / Inactive
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono text-rose-700 leading-none flex items-center gap-1">
              {inactiveCount}
              {inactiveCount > 0 && <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 inline" />}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Responsive SVG Chart Visualizer */}
      <div className="relative pt-1 flex-1 flex flex-col justify-center">
        {chartMode === 'curve' ? (
          /* Smooth Trajectory Curve */
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-52 sm:h-60 overflow-visible">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#818cf8" stopOpacity="0.05" />
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
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
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

            {/* Gradient Area Fill */}
            <path d={totalArea} fill="url(#growthGrad)" />

            {/* Main Spline Curve */}
            <path
              d={smoothTotalPath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {points.map((p, idx) => {
              const pt = totalPoints[idx] || { x: 0, y: 0 };
              const isHovered = hoveredIdx === idx;

              return (
                <g key={idx} className="cursor-pointer">
                  {/* Hover Guide Line */}
                  {isHovered && (
                    <g>
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={svgHeight - paddingBottom}
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle cx={pt.x} cy={pt.y} r="10" fill="#6366f1" fillOpacity="0.15" />
                    </g>
                  )}

                  {/* X Axis Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isHovered ? '800' : '600'}
                    fill={isHovered ? '#4f46e5' : '#64748b'}
                  >
                    {p.label}
                  </text>

                  {/* Marker Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              );
            })}
          </svg>
        ) : (
          /* Bi-Directional Joiners vs Exits Bar Chart */
          <div className="flex items-end justify-around gap-3 h-52 sm:h-60 px-4 border-b border-slate-200 pb-2">
            {points.map((p, idx) => {
              const isHovered = hoveredIdx === idx;
              const addedHeight = Math.round(((p.added || 0) / maxVal) * 100);
              const removedHeight = Math.round(((p.removed || 0) / maxVal) * 100);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer max-w-[60px]"
                >
                  <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                    {/* Added Column */}
                    <div
                      style={{ height: `${Math.max(addedHeight, 8)}%` }}
                      className="w-1/2 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all group-hover:brightness-110"
                      title={`Added: ${p.added || 0}`}
                    />
                    {/* Removed Column */}
                    <div
                      style={{ height: `${Math.max(removedHeight, 4)}%` }}
                      className="w-1/2 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg transition-all group-hover:brightness-110"
                      title={`Removed: ${p.removed || 0}`}
                    />
                  </div>

                  <span className={cn(
                    "text-[10px] font-bold font-mono mt-1",
                    isHovered ? "text-indigo-600" : "text-slate-500"
                  )}>
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute top-0 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-2xl shadow-xl pointer-events-none z-20 space-y-1.5 border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${(getCoordinates(points[hoveredIdx].total, hoveredIdx).x / svgWidth) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300 font-mono border-b border-slate-800 pb-1">
              <span className="font-bold text-white">{points[hoveredIdx].date || points[hoveredIdx].label}</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                Workforce Point
              </span>
            </div>
            <div className="space-y-1 pt-0.5 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Total Workforce:</span>
                <span className="font-bold text-white">{points[hoveredIdx].total}</span>
              </div>
              <div className="flex items-center justify-between gap-6 text-indigo-300">
                <span>+ Joiners:</span>
                <span className="font-bold">+{points[hoveredIdx].added || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-6 text-rose-300">
                <span>- Exits:</span>
                <span className="font-bold">{points[hoveredIdx].removed || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeGrowthTrendChart;
