import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function EmployeeGrowthTrendChart({
  growthData,
  range = '30d',
  setRange,
  loading = false,
}) {
  const points = growthData?.points || [];
  const netWorkforce = growthData?.net_workforce || 0;
  const activeCount = growthData?.active_count || 0;
  const inactiveCount = growthData?.inactive_count || 0;

  const maxTotal = Math.max(...points.map((p) => p.total), 5);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Workforce Growth & Turnaround</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered employee trajectory, new joiners, and deactivations
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setRange?.(btn.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px]',
                range === btn.id
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
            Net Workforce
          </span>
          <span className="text-lg font-extrabold font-mono text-slate-900">
            {netWorkforce.toLocaleString()}
          </span>
        </div>

        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 space-y-0.5">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
            Active Staff
          </span>
          <span className="text-lg font-extrabold font-mono text-emerald-600">
            {activeCount.toLocaleString()}
          </span>
        </div>

        <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 space-y-0.5">
          <span className="text-[10px] text-rose-700 font-semibold uppercase tracking-wider block">
            Inactive Staff
          </span>
          <span className="text-lg font-extrabold font-mono text-rose-600">
            {inactiveCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bar visualizer for the selected period */}
      <div className="space-y-3 pt-2">
        <div className="flex items-end justify-between gap-3 h-36 px-2 border-b border-slate-100">
          {points.map((p, idx) => {
            const heightPct = Math.round((p.total / maxTotal) * 100);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                <div
                  style={{ height: `${Math.max(heightPct, 10)}%` }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl group-hover:from-indigo-700 group-hover:to-indigo-500 transition-all flex flex-col justify-between items-center p-1"
                >
                  <span className="text-[9px] font-bold text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
          {points.map((p, idx) => (
            <span key={idx} className="text-center flex-1">
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployeeGrowthTrendChart;
