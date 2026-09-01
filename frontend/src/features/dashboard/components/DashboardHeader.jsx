import React from 'react';
import { RefreshCw, Download, Calendar, Sparkles, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DashboardHeader({
  dateRange = 'month',
  setDateRange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
  onExport,
}) {
  const dateOptions = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Enterprise Analytics
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Employee & Face Recognition Analytics
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          {dateOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDateRange(opt.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                dateRange === opt.id
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          title="Refresh dashboard data"
        >
          <RefreshCw className={cn('w-3.5 h-3.5 text-slate-600', isRefreshing && 'animate-spin text-indigo-600')} />
          <span>Refresh</span>
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Export analytics report"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
