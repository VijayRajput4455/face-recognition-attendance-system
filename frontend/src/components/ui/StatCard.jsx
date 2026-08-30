import React from 'react';
import { cn } from '../../lib/utils';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  loading = false,
  className,
  onClick,
}) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-9 w-9 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl border flex items-center justify-center shrink-0', colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded-sm',
              trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {(subtitle || trendLabel) && (
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          {subtitle}
          {trendLabel && <span className="ml-1 text-slate-400">({trendLabel})</span>}
        </p>
      )}
    </div>
  );
}

export default StatCard;
