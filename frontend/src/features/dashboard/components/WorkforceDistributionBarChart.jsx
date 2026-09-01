import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Building2,
  Clock,
  Briefcase,
  ArrowUpDown,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn, formatTime } from '../../../lib/utils';

// Harmonious, high-contrast modern palette for pie chart slices
const SLICE_PALETTE = [
  { stroke: '#6366f1', fill: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
  { stroke: '#3b82f6', fill: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  { stroke: '#10b981', fill: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  { stroke: '#f59e0b', fill: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { stroke: '#ec4899', fill: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
  { stroke: '#8b5cf6', fill: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  { stroke: '#06b6d4', fill: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
];

export function WorkforceDistributionBarChart({
  departments = [],
  shifts = [],
  designations = [],
  onSelectDepartment,
  onSelectShift,
  onSelectDesignation,
}) {
  const [dimension, setDimension] = useState('departments'); // 'departments' | 'shifts' | 'designations'
  const [viewType, setViewType] = useState('bars'); // 'bars' | 'pie' | 'split'
  const [sortBy, setSortBy] = useState('highest'); // 'highest' | 'lowest' | 'name'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Normalize data depending on active dimension
  const currentItems = useMemo(() => {
    if (dimension === 'departments') {
      return departments.map((d, i) => ({
        id: d.id,
        name: d.department_name,
        total: d.total ?? 0,
        enrolled: d.enrolled ?? 0,
        pending: d.pending ?? 0,
        rate: d.completion_percentage ?? 0,
        extra: `${d.enrolled ?? 0} Enrolled`,
        category: 'department',
        color: SLICE_PALETTE[i % SLICE_PALETTE.length],
      }));
    } else if (dimension === 'shifts') {
      return shifts.map((s, i) => ({
        id: s.id,
        name: s.shift_name,
        total: s.total ?? 0,
        enrolled: s.enrolled ?? 0,
        pending: s.pending ?? 0,
        rate: s.completion_percentage ?? 0,
        extra: `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`,
        category: 'shift',
        color: SLICE_PALETTE[i % SLICE_PALETTE.length],
      }));
    } else {
      return designations.map((desig, i) => ({
        id: desig.id,
        name: desig.designation_name,
        total: desig.employee_count ?? 0,
        enrolled: desig.employee_count ?? 0,
        pending: 0,
        rate: 100,
        extra: `${desig.employee_count ?? 0} Staff`,
        category: 'designation',
        color: SLICE_PALETTE[i % SLICE_PALETTE.length],
      }));
    }
  }, [dimension, departments, shifts, designations]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...currentItems].sort((a, b) => {
      if (sortBy === 'highest') return b.total - a.total;
      if (sortBy === 'lowest') return a.total - b.total;
      return a.name.localeCompare(b.name);
    });
  }, [currentItems, sortBy]);

  const maxVal = Math.max(...currentItems.map((i) => i.total), 5);
  const totalWorkforce = currentItems.reduce((acc, i) => acc + i.total, 0);

  // Compute Pie Slices
  const pieSlices = useMemo(() => {
    if (totalWorkforce === 0) return [];
    let cumulativeAngle = 0;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;

    return sortedItems.map((item, idx) => {
      const sharePct = (item.total / totalWorkforce) * 100;
      const strokeDash = (sharePct / 100) * circumference;
      const strokeOffset = circumference - (cumulativeAngle / 360) * circumference;
      const angle = (sharePct / 100) * 360;
      cumulativeAngle += angle;

      return {
        ...item,
        sharePct: sharePct.toFixed(1),
        strokeDash: `${strokeDash} ${circumference}`,
        strokeOffset,
        color: item.color || SLICE_PALETTE[idx % SLICE_PALETTE.length],
      };
    });
  }, [sortedItems, totalWorkforce]);

  // Intelligent Insights
  const insights = useMemo(() => {
    if (currentItems.length === 0) return null;

    const highestAllocated = [...currentItems].sort((a, b) => b.total - a.total)[0];
    const mostPending = [...currentItems].sort((a, b) => b.pending - a.pending)[0];
    const highestCompliance = [...currentItems]
      .filter((i) => i.total > 0)
      .sort((a, b) => b.rate - a.rate)[0];

    return {
      topAllocated: highestAllocated?.total > 0 ? highestAllocated : null,
      topPending: mostPending?.pending > 0 ? mostPending : null,
      topCompliance: highestCompliance || null,
    };
  }, [currentItems]);

  const handleBarClick = (item) => {
    if (item.category === 'department') onSelectDepartment?.(item.id);
    else if (item.category === 'shift') onSelectShift?.(item.id);
    else if (item.category === 'designation') onSelectDesignation?.(item.id);
  };

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with Dimension & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Workforce Allocation & Face Recognition Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-attribute workforce share and face recognition readiness breakdown
          </p>
        </div>


        {/* Dimension & View Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          {/* Dimension Selector Tabs */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs gap-0.5">
            <button
              type="button"
              onClick={() => { setDimension('departments'); setHoveredIdx(null); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                dimension === 'departments'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments</span>
            </button>
            <button
              type="button"
              onClick={() => { setDimension('shifts'); setHoveredIdx(null); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                dimension === 'shifts'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Shifts</span>
            </button>
            <button
              type="button"
              onClick={() => { setDimension('designations'); setHoveredIdx(null); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                dimension === 'designations'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Designations</span>
            </button>
          </div>

          {/* View Mode Toggle: Bars / Pie / Split */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs gap-0.5">
            <button
              type="button"
              onClick={() => setViewType('bars')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer',
                viewType === 'bars'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="Vertical Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
            <button
              type="button"
              onClick={() => setViewType('pie')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer',
                viewType === 'pie'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="Pie Chart with Percentage Share"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie (%)</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'highest' ? 'lowest' : prev === 'lowest' ? 'name' : 'highest'))}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700 bg-white shadow-2xs cursor-pointer hover:text-indigo-600 transition-colors"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{sortBy}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Insights Strip */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Top Allocated Unit */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shadow-2xs shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block truncate">
                Largest Share
              </span>
              <span className="text-xs font-extrabold text-slate-900 truncate block">
                {insights.topAllocated ? `${insights.topAllocated.name} (${insights.topAllocated.total})` : 'None'}
              </span>
            </div>
          </div>

          {/* Biometric Compliance Leader */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block truncate">
                Compliance Leader
              </span>
              <span className="text-xs font-extrabold text-slate-900 truncate block">
                {insights.topCompliance ? `${insights.topCompliance.name} (${insights.topCompliance.rate}%)` : 'None'}
              </span>
            </div>
          </div>

          {/* Pending Priority Unit */}
          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shadow-2xs shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block truncate">
                Pending Focus
              </span>
              <span className="text-xs font-extrabold text-slate-900 truncate block">
                {insights.topPending ? `${insights.topPending.name} (${insights.topPending.pending} pending)` : 'All Enrolled'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Chart Visualizer (Vertical Bars OR Pie Chart) */}
      {sortedItems.length === 0 ? (
        <div className="py-14 text-center text-xs text-slate-400 space-y-2 my-auto">
          <BarChart3 className="w-8 h-8 mx-auto text-slate-300" />
          <p>No configuration records found for this dimension.</p>
        </div>
      ) : viewType === 'pie' ? (
        /* PIE / DONUT PERCENTAGE SHARE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto py-2">
          {/* Donut SVG Arc Visualization */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />

                {/* Slices with Percentage Offsets */}
                {totalWorkforce > 0 &&
                  pieSlices.map((slice, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                      <circle
                        key={slice.id}
                        cx="80"
                        cy="80"
                        r="64"
                        fill="none"
                        stroke={slice.color.stroke}
                        strokeWidth={isHovered ? 24 : 20}
                        strokeDasharray={slice.strokeDash}
                        strokeDashoffset={slice.strokeOffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    );
                  })}
              </svg>

              {/* Central Donut Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {hoveredIdx !== null && pieSlices[hoveredIdx] ? (
                  <>
                    <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                      {pieSlices[hoveredIdx].sharePct}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 truncate max-w-[100px]">
                      {pieSlices[hoveredIdx].name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                      {totalWorkforce}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      Total Staff
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pie Percentage Breakdown Cards */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {pieSlices.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleBarClick(item)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={cn(
                    'p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-2xs',
                    isHovered
                      ? 'bg-slate-50/90 border-indigo-300 shadow-sm scale-[1.02]'
                      : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color.stroke }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {item.total} Staff • {item.extra}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-black font-mono text-slate-900 block">
                      {item.sharePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VERTICAL BAR CHART VIEW */
        <div className="space-y-4 my-auto">
          {/* Legend and Total Header */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-gradient-to-t from-indigo-700 to-indigo-500 shadow-2xs" />
                <span className="text-slate-700">Face Enrolled</span>
              </div>
              {dimension !== 'designations' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-t from-amber-500 to-amber-400 shadow-2xs" />
                  <span className="text-slate-700">Pending Action</span>
                </div>
              )}
            </div>
            <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              Total: {totalWorkforce} Staff
            </span>
          </div>

          {/* Vertical Bar Grid Container */}
          <div className="relative pt-4 pb-2 border-b border-slate-200">
            {/* Background Horizontal Grid Lines & Y-Axis Labels */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none">
              {gridTicks.map((ratio, i) => (
                <div key={i} className="flex items-center gap-2 w-full">
                  <span className="text-[10px] font-mono text-slate-400 w-6 text-right shrink-0">
                    {Math.round((1 - ratio) * maxVal)}
                  </span>
                  <div className="h-[1px] w-full bg-slate-100 border-t border-dashed border-slate-200" />
                </div>
              ))}
            </div>

            {/* Vertical Columns Container */}
            <div className="relative pl-8 pr-2 flex items-end justify-around gap-2 sm:gap-4 h-56 sm:h-64 z-10">
              {sortedItems.map((item, idx) => {
                const isHovered = hoveredIdx === idx;
                const totalPct = (item.total / maxVal) * 100;
                const enrolledPct = item.total > 0 ? (item.enrolled / item.total) * 100 : 0;
                const pendingPct = item.total > 0 ? (item.pending / item.total) * 100 : 0;
                const sharePct = totalWorkforce > 0 ? ((item.total / totalWorkforce) * 100).toFixed(1) : '0.0';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleBarClick(item)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer max-w-[90px]"
                  >
                    {/* Top Value Tooltip / Label */}
                    <div className={cn(
                      "text-[11px] font-bold font-mono mb-1 transition-all",
                      isHovered ? "text-indigo-600 scale-110" : "text-slate-700"
                    )}>
                      {item.total}
                    </div>

                    {/* The Vertical Bar Container */}
                    <div className="w-full bg-slate-100/80 rounded-2xl overflow-hidden p-1 flex flex-col justify-end border border-slate-200/80 transition-all duration-300 group-hover:border-indigo-300 group-hover:shadow-md h-full max-h-full">
                      <div
                        style={{ height: `${Math.max(totalPct, 6)}%` }}
                        className="w-full flex flex-col justify-end rounded-xl overflow-hidden transition-all duration-700 shadow-2xs"
                      >
                        {/* Pending Segment (Top of stack) */}
                        {pendingPct > 0 && (
                          <div
                            style={{ height: `${pendingPct}%` }}
                            className="w-full bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-500"
                            title={`Pending: ${item.pending}`}
                          />
                        )}

                        {/* Enrolled Segment (Bottom of stack) */}
                        {enrolledPct > 0 && (
                          <div
                            style={{ height: `${enrolledPct}%` }}
                            className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 transition-all duration-500"
                            title={`Enrolled: ${item.enrolled}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Floating Tooltip Box on Hover */}
                    {isHovered && (
                      <div className="absolute -top-18 bg-slate-900 text-white text-xs font-semibold p-2.5 rounded-xl shadow-xl z-30 pointer-events-none whitespace-nowrap border border-slate-800 space-y-1 animate-in fade-in zoom-in-95">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono border border-emerald-800">
                            {sharePct}% Share
                          </span>
                        </div>
                        <div className="text-[11px] font-mono space-y-0.5 pt-0.5">
                          <div className="flex justify-between gap-3 text-slate-300">
                            <span>Total:</span>
                            <span className="font-bold text-white">{item.total}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-indigo-300">
                            <span>Enrolled:</span>
                            <span className="font-bold">{item.enrolled}</span>
                          </div>
                          {dimension !== 'designations' && (
                            <div className="flex justify-between gap-3 text-amber-300">
                              <span>Pending:</span>
                              <span className="font-bold">{item.pending}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-Axis Labels Row */}
          <div className="pl-8 pr-2 flex justify-around gap-2 sm:gap-4">
            {sortedItems.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              const sharePct = totalWorkforce > 0 ? ((item.total / totalWorkforce) * 100).toFixed(0) : '0';
              return (
                <div
                  key={item.id}
                  onClick={() => handleBarClick(item)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 text-center cursor-pointer max-w-[90px] group"
                >
                  <span
                    className={cn(
                      'text-xs font-bold block truncate transition-colors',
                      isHovered ? 'text-indigo-600' : 'text-slate-800'
                    )}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold block truncate">
                    {sharePct}% Share
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkforceDistributionBarChart;
