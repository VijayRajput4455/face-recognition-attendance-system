import React from 'react';
import { RefreshCw, Download, Sparkles } from 'lucide-react';
import PageBanner from '../../../components/ui/PageBanner';
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
    <PageBanner
      badge="Enterprise Analytics"
      badgeIcon={Sparkles}
      title="Executive Dashboard"
      description="Real-time employee metrics, facial recognition telemetry, and biometric workforce analytics."
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs">
            {dateOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  dateRange === opt.id
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/15 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-indigo-200', isRefreshing && 'animate-spin text-white')} />
            <span>Refresh</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            title="Export analytics report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Report</span>
          </button>
        </div>
      }
    />
  );
}

export default DashboardHeader;
