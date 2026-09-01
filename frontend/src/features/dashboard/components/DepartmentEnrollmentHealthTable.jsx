import React, { useState } from 'react';
import { Building2, ArrowUpDown, Plus, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DepartmentEnrollmentHealthTable({
  departments = [],
  onSelectDepartment,
}) {
  const [sortField, setSortField] = useState('total'); // 'total' | 'rate' | 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [healthFilter, setHealthFilter] = useState('ALL'); // 'ALL' | 'high' | 'moderate' | 'low'

  const data = departments.map((dept) => {
    const total = dept.total ?? 0;
    const enrolled = dept.enrolled ?? 0;
    const pending = dept.pending ?? 0;
    const completion = dept.completion_percentage ?? (total > 0 ? ((enrolled / total) * 100).toFixed(1) : 0.0);
    const health =
      dept.health || (completion >= 85 ? 'high' : completion >= 70 ? 'moderate' : 'low');

    return {
      id: dept.id,
      name: dept.department_name,
      total,
      enrolled,
      pending,
      completion: parseFloat(completion) || 0,
      health,
    };
  });

  // Filter by health category if selected
  const filteredData = healthFilter === 'ALL' ? data : data.filter((d) => d.health === healthFilter);

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    let result = 0;
    if (sortField === 'name') result = a.name.localeCompare(b.name);
    else if (sortField === 'rate') result = a.completion - b.completion;
    else result = a.total - b.total;
    return sortOrder === 'desc' ? -result : result;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const highCount = data.filter((d) => d.health === 'high').length;
  const modCount = data.filter((d) => d.health === 'moderate').length;
  const lowCount = data.filter((d) => d.health === 'low').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with interactive filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Department Enrollment Health</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative enrollment compliance across all organizational units
          </p>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex flex-wrap items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs self-start sm:self-auto shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setHealthFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              healthFilter === 'ALL'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            All ({data.length})
          </button>
          <button
            type="button"
            onClick={() => setHealthFilter(healthFilter === 'high' ? 'ALL' : 'high')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              healthFilter === 'high'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-emerald-700 hover:bg-emerald-50'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', healthFilter === 'high' ? 'bg-white' : 'bg-emerald-500')} />
            High &ge;85% ({highCount})
          </button>
          <button
            type="button"
            onClick={() => setHealthFilter(healthFilter === 'moderate' ? 'ALL' : 'moderate')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              healthFilter === 'moderate'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'text-amber-700 hover:bg-amber-50'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', healthFilter === 'moderate' ? 'bg-white' : 'bg-amber-500')} />
            70-84% ({modCount})
          </button>
          <button
            type="button"
            onClick={() => setHealthFilter(healthFilter === 'low' ? 'ALL' : 'low')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
              healthFilter === 'low'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-rose-700 hover:bg-rose-50'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', healthFilter === 'low' ? 'bg-white' : 'bg-rose-500')} />
            &lt;70% ({lowCount})
          </button>
        </div>
      </div>

      {/* 2. Modern Table Content */}
      {departments.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-2.5 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">No departments configured yet</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Add departments to track organizational biometric compliance</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectDepartment?.()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto my-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => toggleSort('name')}
                  className="pb-3 pr-4 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    Department
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('total')}
                  className="pb-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors text-right"
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Total Staff
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="pb-3 px-4 text-right">Face Enrolled</th>
                <th className="pb-3 px-4 text-right">Pending</th>
                <th
                  onClick={() => toggleSort('rate')}
                  className="pb-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors text-right"
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Compliance Rate
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="pb-3 pl-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectDepartment?.(row.id)}
                  className="hover:bg-indigo-50/30 transition-all cursor-pointer group rounded-xl"
                >
                  {/* Department Name */}
                  <td className="py-3.5 pr-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-indigo-100 border border-slate-200/60 group-hover:border-indigo-200 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{row.name}</span>
                    </div>
                  </td>

                  {/* Total Staff */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/60">
                      {row.total.toLocaleString()}
                    </span>
                  </td>

                  {/* Face Enrolled */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60">
                      {row.enrolled.toLocaleString()}
                    </span>
                  </td>

                  {/* Pending */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/60">
                      {row.pending.toLocaleString()}
                    </span>
                  </td>

                  {/* Compliance Rate Gauge */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60 hidden sm:block">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            row.health === 'high'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : row.health === 'moderate'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          )}
                          style={{ width: `${Math.max(row.completion, 3)}%` }}
                        />
                      </div>
                      <span className="font-mono font-extrabold text-slate-900 min-w-[42px] text-right">
                        {row.completion}%
                      </span>
                    </div>
                  </td>

                  {/* Health Status Badge */}
                  <td className="py-3.5 pl-4 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border shadow-2xs transition-all',
                        row.health === 'high'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : row.health === 'moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                          : 'bg-rose-50 text-rose-700 border-rose-200/80'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          row.health === 'high'
                            ? 'bg-emerald-500'
                            : row.health === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-rose-500 animate-pulse'
                        )}
                      />
                      {row.health === 'high'
                        ? 'Optimal'
                        : row.health === 'moderate'
                        ? 'Moderate'
                        : 'Attention Needed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DepartmentEnrollmentHealthTable;
