import React, { useState } from 'react';
import { Briefcase, ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowDownAZ } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DesignationDistributionChart({
  designations = [],
  onSelectDesignation,
}) {
  const [sortBy, setSortBy] = useState('highest'); // 'highest' | 'lowest' | 'alphabetical'

  const data = designations.map((desig) => ({
    id: desig.id,
    name: desig.designation_name,
    count: desig.employee_count ?? 0,
  }));

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'highest') return b.count - a.count;
    if (sortBy === 'lowest') return a.count - b.count;
    return a.name.localeCompare(b.name);
  });

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Employee Distribution by Designation</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Headcount breakdown across organizational roles and job titles
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSortBy('highest')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              sortBy === 'highest'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
            title="Sort highest to lowest"
          >
            <ArrowDownWideNarrow className="w-3.5 h-3.5" />
            <span>Highest</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy('lowest')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              sortBy === 'lowest'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
            title="Sort lowest to highest"
          >
            <ArrowUpNarrowWide className="w-3.5 h-3.5" />
            <span>Lowest</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy('alphabetical')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              sortBy === 'alphabetical'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
            title="Sort alphabetically"
          >
            <ArrowDownAZ className="w-3.5 h-3.5" />
            <span>A-Z</span>
          </button>
        </div>
      </div>

      {designations.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
          <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
          <p>No job designations configured in the database yet.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedData.map((item) => {
            const pct = Math.round((item.count / maxCount) * 100);

            return (
              <div
                key={item.id}
                onClick={() => onSelectDesignation?.(item.id)}
                className="space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-xs">
                    {item.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {item.count.toLocaleString()} Staff
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 group-hover:bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DesignationDistributionChart;
